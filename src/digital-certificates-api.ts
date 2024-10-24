/**
 * @file Digital Certificates API
 * 
 * This file was initially called Data Bundler in the design, but now it is the
 * Digital Certificates API. It serves as the interface that third-party
 * applications would use to interact with the module.
***/

interface DigitalCertificatesAPI {
  generate_certificates: (receipients: string, template_docx: string, output_plugins: [string]) => Promise<undefined>;
}