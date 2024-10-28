/**
 * @file Digital Certificates API
 *
 * This file was initially called Data Bundler in the design, but now it is the
 * Digital Certificates API. It serves as the interface that third-party
 * applications would use to interact with the module. It also takes care of
 * processing the input and converting it into the format required by the
 * internal modules (e.g., CSV or Excel into 2D array).
 **/

/**
 * Interface representing the Digital Certificates API.
 **/
interface DigitalCertificatesAPIInterface {
  /**
   * Generates digital certificates for the given recipients using the
   * specified template and output plugins.
   *
   * @param receipients - Path to the CSV file containing the recipients' data.
   * @param template_docx - A string representing the path to the DOCX
   *                        template file.
   * @param output_plugins - An array of strings specifying the output plugins
   *                         to be used.
   * @returns A promise that resolves to undefined when the certificates
   *          are generated.
   **/
  generate_certificates: (
    receipients: string,
    template_docx: string,
    output_plugins: [string],
  ) => Promise<undefined>; // FIXME: What should it resolve to?
}

export default class DigitalCertificatesAPI
  implements DigitalCertificatesAPIInterface
{
  generate_certificates(
    receipients: string,
    template_docx: string,
    output_plugins: [string],
  ): Promise<undefined> {
    return new Promise((resolve, reject) => {
      // Not implemented
    });
  }
}
