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

import { PluginOuputStatus } from "./output-manager";

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
 * @property {Array<PluginOuputStatus>} output_plugins_status - An array containing the status of each output plugin.
 */
export type GenerationStatus = {
  status: GenStatusEnum;
  message: string;
  output_plugins_status: Array<PluginOuputStatus>;
};

export default class DigitalCertificatesManager {
  /**
   * Generates digital certificates using the specified template and output
   * plugins.
   *
   * @param template_path - Path to the template file used for generating
   *                        certificates.
   * @param certificates_data - A 2D array containing the data for each
   *                            certificate.
   * @param output_plugins - An array of strings specifying the output plugins
   *                         to be used.
   * @param bundle_metadata - Metadata associated with the certificate bundle.
   * @returns A promise that resolves to undefined when the certificates are
   *          generated.
   **/
  generate_certificates(
    template_path: string,
    certificates_data: CertificatesData,
    output_plugins: string[],
    tmp_folder: string = "./tmp",
    bundle_metadata: any = {}, // FIXME: What type should this be?
  ): Promise<GenerationStatus> {
    return new Promise((resolve, reject) => {
      // Generate PDFS.
      // Call on each output plugin.
      resolve({
        status: GenStatusEnum.Failure,
        message: "Failed to generate certificates.",
        output_plugins_status: [],
      });
    });
  }

  set_bundle_metadata(metadata: any): void {
    // Set metadata.
  }
}
