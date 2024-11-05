/**
 * Certificate Generation Manager
 *
 * This module is the main component of the project responsible for managing
 * the certificate generation process. It handles the following tasks:
 *
 * 1. Receiving input data required for certificate generation.
 * 2. Calling the generation module to create certificates in PDF format.
 * 3. Interacting with the output controller to provide the necessary data
 *    for the various plugins.
 *
 * The module ensures that the entire certificate generation workflow is
 * executed seamlessly, from input reception to the final output distribution.
 **/

import { PluginConfig, PluginOutputStatus } from "./output-manager";
import {
  IssueMetadataType,
  output_plugins_data_type,
  pdf_data,
  PDFGeneratedStatus,
} from "./pdf-gen-definitions";
import PDFGeneration from "./pdf-generation";
import CertificatesOutputManager from "./output-manager";

import path from "path";

/**
 * Certificates Data
 *
 * Type definition for the data structure that holds the certificates
 * information. It is represented as a 2D array where the first array are the
 * keys (heading as in a table) and the subsequent arrays are the values for
 * each certificate.
 **/
export type CertificatesData = Array<Array<string>>;

/**
 * Generation Status Enum
 *
 * Enum representing the status of a generation process.
 *
 * @enum {number}
 * @property {number} Success - Generation process completed successfully.
 * @property {number} Warning - Generation process completed with warnings.
 * @property {number} Failure - Generation process failed.
 **/
export enum GenStatusEnum {
  Success,
  Warning,
  Failure,
}

/**
 * Represents the status of a generation process.
 *
 * @typedef {Object} GenerationStatus
 * @property {GenStatusEnum} status - The current status of the generation process.
 * @property {string} message - A message providing additional information about the status.
 * @property {Array<PluginOutputStatus>} output_plugins_status - An array containing the status of each output plugin.
 */
export type GenerationStatus = {
  status: GenStatusEnum;
  message: string;
  output_plugins_status: Array<PluginOutputStatus>;
};

/**
 * Class representing a manager for digital certificates.
 */
export default class DigitalCertificatesManager {
  /**
   * Metadata associated with the digital certificates.
   */
  private metadata: IssueMetadataType;

  /**
   * Constructor
   *
   * Initializes the digital certificates manager with the specified metadata.
   *
   * @param metadata - Metadata associated with the bundle being created.
   */
  constructor() {
    const issue_timestamp = new Date().toISOString();
    this.metadata = {
      issue_timestamp: issue_timestamp,
      others: {},
    };
  }

  /**
   * Generates digital certificates using the specified template and output
   * plugins.
   *
   * @param template_path - The path to the certificate template.
   * @param certificates_data - Data for the certificates to be generated.
   * @param output_plugins - List of output plugins to use for generating certificates.
   * @param tmp_folder - Temporary folder for intermediate files. Defaults to "./tmp".
   * @param output_plugins_data - Configuration data for the output plugins.
   * @param bundle_metadata - Metadata associated with the bundle being created.
   * @returns A promise that resolves to the generation status.
   */
  generate_certificates(
    template_path: string,
    certificates_data: CertificatesData,
    output_plugins: string[],
    output_plugins_data: output_plugins_data_type = {},
    bundle_metadata: any = {},
    tmp_folder: string = "./tmp",
  ): Promise<GenerationStatus> {
    // FIXME: This method needs serious refactoring. It is too long.
    this.metadata.others = bundle_metadata;

    return new Promise((resolve) => {
      const pdf_data: pdf_data[] = certificates_data
        .slice(1)
        .map((data): pdf_data => {
          return data.map((value, index): [string, string] => [
            certificates_data[0][index],
            value,
          ]);
        });

      const time = new Date(this.metadata.issue_timestamp).getTime();
      const temp_dir_abs_path = path.resolve(tmp_folder, time.toString());
      const output_paths: Array<string> = certificates_data
        .slice(1)
        .map((_data, index) => {
          return path.resolve(temp_dir_abs_path, `${index}.pdf`);
        });

      const pdf_gen = new PDFGeneration();
      pdf_gen.set_template(template_path);
      pdf_gen.generate_pdfs(pdf_data, output_paths).then((pdf_gen_output) => {
        if (!Array.isArray(pdf_gen_output)) {
          resolve({
            status: GenStatusEnum.Failure,
            message: `There was an error generating the PDFs. ${(pdf_gen_output as PDFGeneratedStatus).message}`,
            output_plugins_status: [],
          });
        } else {
          const output_manager = new CertificatesOutputManager();
          output_manager.set_plugins_dir(
            path.resolve(__dirname, "./output-plugins"),
          );

          const plgs_configs: Array<PluginConfig> = output_plugins.map(
            (plugin_id) => {
              return {
                id: plugin_id,
                config: output_plugins_data[plugin_id]
                  ? output_plugins_data[plugin_id]
                  : {},
              };
            },
          );

          output_manager
            .generateOutput(
              plgs_configs,
              temp_dir_abs_path,
              certificates_data,
              this.metadata,
            )
            .then((output_statuses) => {
              Promise.all(output_statuses).then((output_statuses) => {
                resolve({
                  status: GenStatusEnum.Success,
                  message: "Certificates generated successfully.",
                  output_plugins_status: output_statuses,
                });
              });
            });
        }
      });
    });
  }
}
