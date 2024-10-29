/**
 * @file CLI for the Digital Certificates generation tool.
 **/

/**
 * Entry point for the Digital Certificates generation tool when run as a standalone script.
 *
 * This script expects the following command-line arguments:
 * - `<recipients>`: Path to the recipients file.
 * - `<template_docx>`: Path to the DOCX template file.
 * - `<output_plugins>`: Comma-separated list of output plugins.
 * - `[tmp_folder]`: Optional temporary folder path.
 *
 * Usage:
 * ```sh
 * node digital-certificates-api.js <recipients> <template_docx> <output_plugins> [tmp_folder]
 * ```
 *
 * If the required arguments are not provided, the script will print a usage message and exit with an error code.
 *
 * The script initializes the `DigitalCertificatesAPI` and calls the `generate_certificates` method with the provided arguments.
 * It logs the status of the certificate generation process or any errors encountered.
 **/

import DigitalCertificatesAPI from "./digital-certificates-api";

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error(
      "Usage: node digital-certificates-api.js <recipients> <template_docx> <output_plugins> [tmp_folder]",
    );
    process.exit(1);
  }

  const [recipients, template_docx, output_plugins, tmp_folder] = args;
  const outputPluginsArray = output_plugins.split(",");

  const api = new DigitalCertificatesAPI();
  api
    .generate_certificates(
      recipients,
      template_docx,
      outputPluginsArray,
      tmp_folder,
    )
    .then((status) => {
      console.log("Certificates generated successfully:", status);
    })
    .catch((error) => {
      console.error("Error generating certificates:", error);
    });
}
