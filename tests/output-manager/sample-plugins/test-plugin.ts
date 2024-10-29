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
} from "../../../src/output-manager";

import { CertificatesData } from "../../../src/digital-certificates-manager";
import { IssueMetadataType } from "../../../src/pdf-gen-definitions";

const TestPlugin: CertificatesOutputPlugin = {
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
    pdfs_temp_dir: string,
    certificates_data: CertificatesData,
    issue_metadata: IssueMetadataType,
  ): Promise<PluginOutputStatus> {
    return new Promise((resolve, reject) => {
      resolve({
        status: POStatus.Success,
        message: "Success",
      });
    });
  },
};

export default TestPlugin;
