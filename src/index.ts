import DigitalCertificatesAPI from "./digital-certificates-api";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import path from "path";

import {
  output_plugins_data_type,
  PDFGeneratedStatus,
  PDFGenerationStatusEnum,
} from "./pdf-gen-definitions";
import {
  GenerationStatus,
  GenStatusEnum,
} from "./digital-certificates-manager";
import { PluginOutputStatus } from "./output-manager";

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option("recipients", {
      alias: "r",
      type: "string",
      demandOption: true,
      describe: "Path to the recipients file.",
    })
    .option("template", {
      alias: "t",
      type: "string",
      demandOption: true,
      describe: "Path to the template file.",
    })
    .option("output-config", {
      alias: "o",
      type: "string",
      describe: "Path to the output plugins configuration file (JSON).",
    })
    .option("bunlde-metadata", {
      alias: "b",
      type: "string",
      describe: "Path to the bundle metadata file (JSON).",
    })
    .option("temp-folder", {
      alias: "f",
      type: "string",
      describe: "Path to the temporary folder.",
    })
    .help()
    .alias("help", "h").argv;

  const resolvedArgv = await argv;

  const recipientsFile = resolvedArgv.recipients;
  const templateFile = resolvedArgv.template;
  const outputConfigFile = resolvedArgv.outputConfig;
  const bundleMetadataFile = resolvedArgv.bundleMetadata;
  const tempFolder = resolvedArgv.tempFolder || path.join(__dirname, "temp");

  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder, { recursive: true });
  }

  const recipients = path.resolve(recipientsFile);
  const template = path.resolve(templateFile);
  let outputConfig = {};

  let output_plugins: Array<string> = [];
  if (outputConfigFile) {
    outputConfig = JSON.parse(fs.readFileSync(outputConfigFile, "utf-8"));
    output_plugins = Object.keys(outputConfig);
  }

  let bundle_metadata = {};
  if (bundleMetadataFile) {
    let bm_filepath = path.resolve(bundleMetadataFile as string);
    bundle_metadata = JSON.parse(fs.readFileSync(bm_filepath, "utf-8"));
  }

  const digitalCertificatesAPI = new DigitalCertificatesAPI();
  const output_status: GenerationStatus =
    await digitalCertificatesAPI.generate_certificates(
      recipients,
      template,
      output_plugins,
      outputConfig as output_plugins_data_type,
      bundle_metadata,
      tempFolder,
    );

  console.log(output_status.message);

  if (output_status.status !== GenStatusEnum.Success) {
    for (
      let i = 0;
      i < (output_status.generation_status as Array<PDFGeneratedStatus>).length;
      i++
    ) {
      const gen_status = (
        output_status.generation_status as Array<PDFGeneratedStatus>
      )[i];
      if (gen_status.status !== PDFGenerationStatusEnum.success) {
        console.log(`PDF ${i + 1}: ${gen_status.message}`);
      }
    }
  }

  for (let i = 0; i < output_status.output_plugins_status.length; i++) {
    const output_plugin: PluginOutputStatus =
      output_status.output_plugins_status[i];
    const output_plugin_name = output_plugins[i];
    const output_plugin_message = output_plugin.message;

    console.log(
      `Output plugin ${output_plugin_name}: ${output_plugin_message}`,
    );
  }
}

if (require.main === module) {
  main();
}
