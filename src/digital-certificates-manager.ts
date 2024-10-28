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

/**
 * Certificates Data
 *
 * Type definition for the data structure that holds the certificates
 * information. It is represented as a 2D array where the first array are the
 * keys (heading as in a table) and the subsequent arrays are the values for
 * each certificate.
 **/
export type CertificatesData = [][];

export default class DigitalCertificatesManager {
  /**
   * Generates digital certificates for the specified recipients using the
   * provided template and output plugins.
   *
   * @param recipients - Path to the file containing the recipients' data.
   * @param template_docx - Path to the DOCX template file.
   * @param output_plugins - An array of strings specifying the output plugins
   *                         to be used.
   * @returns A promise that resolves to undefined when the certificates
   *          are generated.
   **/
  generate_certificates(
    certificates_data: CertificatesData,
    output_plugins: string[],
  ): Promise<undefined> {
    return new Promise((resolve, reject) => {
      // Generate PDFS.
      // Call on each output plugin.
    });
  }

  set_bundle_metadata(metadata: any): void {
    // Set metadata.
  }
}
