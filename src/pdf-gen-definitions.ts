/**
 * Interface for the PDF generation object.
 **/
export interface PDFGenerationInterface {
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
   * If a file exists in the output path, it will be overwritten.
   *
   * If there the template path is missing, the file does not exist, or a data
   * field is missing, the returned status will indicate the error.
   *
   * @param data - The data to be included in the PDF.
   * @param output - The output file path for the generated PDF.
   * @see pdf_data
   **/
  generate_pdf: (data: pdf_data, output: string) => Promise<PDFGeneratedStatus>;

  /**
   * Generates multiple PDFs with the provided data array and outputs them to
   * the specified path. This function is similar to `generate_pdf`, but it
   * processes a batch of PDFs instead of a single one.
   *
   * If a file exists in the output path, it will be overwritten.
   *
   * Just like `generate_pdf`, if there is an error, the status will indicate
   * the issue. The status will be an array of statuses, one for each PDF in
   * the batch. However, if the error is related to the template path, the
   * status will be a single status object (as it affect all PDFs in the
   * batch).
   *
   * @param data - An array of data objects to be included in the PDFs.
   * @param output - An array of output file paths for the generated PDFs.
   * @see pdf_data
   **/
  generate_pdfs: (
    data: pdf_data[],
    output: string[],
  ) => Promise<PDFGeneratedStatus | PDFGeneratedStatus[]>;
}

/**
 * Configuration for processing a template. This includes the delimiters used
 * to identify placeholders in the template.
 **/
export type proc_config = {
  /**
   * Delimiters used in the processing.
   **/
  delimiters: {
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
  missing_template_path,
  template_does_not_exist,
  missing_fields,
  extra_fields,
  unknown_error,
}

export const PDFGenerationStatusMessages = {
  [PDFGenerationStatusEnum.success]: "PDF generated successfully.",
  [PDFGenerationStatusEnum.missing_template_path]: "Template path not set.",
  [PDFGenerationStatusEnum.template_does_not_exist]:
    "Template file does not exist.",
  [PDFGenerationStatusEnum.missing_fields]: "Missing fields in data.",
  [PDFGenerationStatusEnum.extra_fields]: "Extra fields in data.",
  [PDFGenerationStatusEnum.unknown_error]: "Unknown error occurred.",
};
