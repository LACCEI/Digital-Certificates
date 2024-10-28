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
export type CertificatesData = Array<Array<string>>;

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
    bundle_metadata: any = {}, // FIXME: What type should this be?
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
