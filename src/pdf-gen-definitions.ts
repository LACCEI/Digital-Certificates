/**
 * Interface for the PDF generation object.
 **/
export interface PdfGenerationInterface {
  /**
   * Sets the template for the PDF generation.
   *
   * @param template - Path to the template file to be used.
   **/
  set_template: (template: string) => void;

  /**
   * Sets the processing configuration for the PDF generation. This includes
   * rules to parse the templates and replace the placeholders.
   * @see proc_config
   *
   * @param config - The processing configuration object.
   **/
  set_proc_config: (config: proc_config) => void;

  /**
   * When generating a batch of PDFs, they may all share the same value for
   * some placeholders. This method allows setting these constants to avoid
   * repeating the same data in each PDF. It may be helpful in reducing memory
   * usage and improving performance.
   *
   * @param constants - The constants object.
   * @see pdf_data
   **/
  set_constants: (constants: pdf_data) => void;

  /**
   * Generates a single PDF with the provided data and outputs it to the
   * specified path.
   *
   * If there the template is missing, it does not exist, or a field is
   * missing, returned status will indicate the error.
   *
   * @param data - The data to be included in the PDF.
   * @param output - The output file path for the generated PDF.
   * @see pdf_data
   **/
  generate_pdf: (data: pdf_data, output: string) => PDFGeneratedStatus;

  /**
   * Generates multiple PDFs with the provided data array and outputs them to
   * the specified path. This function is similar to `generate_pdf`, but it
   * processes a batch of PDFs instead of a single one.
   *
   * Just like `generate_pdf`, if there is an error, the status will indicate
   * the issue.
   *
   * @param data - An array of data objects to be included in the PDFs.
   * @param output - The output file path for the generated PDFs.
   * @see pdf_data
   **/
  generate_pdfs: (data: pdf_data[], output: string) => PDFGeneratedStatus;
}

/**
 * Configuration for processing a template. This includes the delimiters used
 * to identify placeholders in the template.
 **/
export type proc_config = {
  /**
   * Delimiters used in the processing.
   **/
  delimters: {
    /**
     * The starting delimiter.
     **/
    start: string;

    /**
     * The ending delimiter.
     **/
    end: string;
  };
};

/**
 * Represents the data to be included in a PDF.
 *
 * This type is a tuple array where each tuple contains two strings.
 * The first string typically represents a key or label, which should match the
 * placeholder. The second string represents the corresponding value.
 *
 * @example
 * data: pdf_data = [
 *   ["name", "John Doe"],
 *   ["date", "2023-10-01"],
 *   ["course", "Introduction to TypeScript"]
 * ];
 **/
export type pdf_data = [string, string][];

/**
 * Represents the status of a PDF generation operation.
 *
 * The `success` field indicates whether the operation was successful. The
 * `message` field contains a message that describes the status of the
 * operation.
 **/
export type PDFGeneratedStatus = {
  status: PDFGenerationStatusEnum;
  message: string;
};

/**
 * Represents the status of a PDF generation operation.
 **/
export enum PDFGenerationStatusEnum {
  success,
  missing_template,
  invalid_template,
  missing_field,
  extra_fields,
  unknown_error,
}
