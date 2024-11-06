/**
 * @file Local Output Plugin
 *
 * This output plugin saves the resulting PDF certificates to the local file
 * system. It makes more sense to use this plugin for a CLI implementation.
 **/

import {
  CertificatesOutputPlugin,
  ConfigFields,
  FieldRequirement,
  PluginOutputStatus,
  POStatus,
} from "../output-manager";

import { CertificatesData } from "../digital-certificates-manager";
import { IssueMetadataType } from "../pdf-gen-definitions";

import path from "path";

const LocalPlugin: CertificatesOutputPlugin = {
  getRequiredFields(): ConfigFields {
    return {
      // The folder where the output PDFs will be saved.
      output_folder: FieldRequirement.Required,

      // The filename of the output PDFs. If not provided, the plugin will use
      // the certificate bundle number as the filename.
      output_filename_col: FieldRequirement.Optional,
    };
  },

  run(
    config: { [key: string]: any },
    pdfs_temp_paths: Array<string>,
    certificates_data: CertificatesData,
    issue_metadata: IssueMetadataType,
  ): Promise<PluginOutputStatus> {
    return new Promise((resolve) => {
      if (!config.output_folder) {
        resolve({
          status: POStatus.Failure,
          message: "Output folder not provided",
        });

        return;
      }

      const output_dir: string = path.resolve(config.output_folder);
      let use_col_filename: boolean = false;
      let col_filename: number = -1;
      if (config.output_filename_col) {
        for (let i = 0; i < certificates_data[0].length; i++) {
          let col_heading: string = certificates_data[0][i];
          if (col_heading === config.output_filename_col) {
            use_col_filename = true;
            col_filename = i;
            break;
          }
        }
      }

      try {
        certificates_data.slice(1).forEach((row: string[], index) => {
          let filename: string;
          if (use_col_filename) {
            filename = row[col_filename];
          } else {
            filename = (index + 1).toString() + ".pdf";
          }

          const output_path: string = path.join(output_dir, filename);

          // Copy the PDF from the temporary directory to the output directory.
          require("fs").copyFileSync(pdfs_temp_paths[index], output_path);
        });
      } catch (error) {
        resolve({
          status: POStatus.Failure,
          message: "Error copying PDFs to output folder. Error: " + error,
        });

        return;
      }

      resolve({
        status: POStatus.Success,
        message: "Success",
      });
    });
  },
};

export default LocalPlugin;
