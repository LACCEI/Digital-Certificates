import {
  PDFGenerationInterface,
  proc_config,
  pdf_data,
  PDFGeneratedStatus,
  PDFGenerationStatusEnum,
  PDFGenerationStatusMessages,
} from "./pdf-gen-definitions";
import PSPDFKit from "pspdfkit";
import path from "path";
import fs from "fs";

export default class PDFGeneration implements PDFGenerationInterface {
  private pspdfkit_config = {
    delimiter: {
      start: "{{",
      end: "}}",
    },
  };

  private template_file_path: string = "";
  private constants: pdf_data = [];

  private get_absolute_path(filePath: string): string {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(__dirname, filePath);
    return absolutePath;
  }

  private does_the_template_exist(path: string): boolean {
    path = this.get_absolute_path(path);
    return fs.existsSync(path);
  }

  set_template(template: string): void {
    this.template_file_path = this.get_absolute_path(template);
  }

  set_proc_config(config: proc_config): void {
    this.pspdfkit_config = {
      delimiter: {
        start: config.delimiters.start,
        end: config.delimiters.end,
      },
    };
  }

  set_constants(constants: pdf_data): void {
    this.constants = constants;
  }

  /**
   * Combine the constants and the data to build the model for PSPDFKit. This
   * method returns a key-value object.
   *
   * @param data - The data to be included in the PDF.
   **/
  private build_model(data: pdf_data): Array<Record<string, unknown>> {
    const model: Record<string, unknown> = {};

    this.constants.forEach(([key, value]) => {
      model[key as string] = value;
    });

    data.forEach(([key, value]) => {
      // Instance data may overwrite constants.
      model[key as string] = value;
    });

    return [model];
  }

  private write_pdf_to_file(pdfBuffer: Buffer, output: string): void {
    fs.writeFileSync(output, pdfBuffer);
  }

  async generate_pdf(
    instance_data: pdf_data,
    output: string,
  ): Promise<PDFGeneratedStatus> {
    if (!this.does_the_template_exist(this.template_file_path)) {
      return Promise.resolve({
        status: PDFGenerationStatusEnum.template_does_not_exist,
        message:
          PDFGenerationStatusMessages[
            PDFGenerationStatusEnum.template_does_not_exist
          ],
      });
    } else if (this.template_file_path === "") {
      return Promise.resolve({
        status: PDFGenerationStatusEnum.missing_template_path,
        message:
          PDFGenerationStatusMessages[
            PDFGenerationStatusEnum.missing_template_path
          ],
      });
    }

    const data = {
      config: {
        ...this.pspdfkit_config,
      },
      model: this.build_model(instance_data),
    };

    try {
      const buffer = await PSPDFKit.populateDocumentTemplate(
        {
          document: this.template_file_path,
          container: "",
        },
        data,
      );

      const pdfBuffer = await PSPDFKit.convertToPDF(
        {
          document: buffer,
          container: "",
        },
        PSPDFKit.Conformance.PDFA_1A,
      );

      this.write_pdf_to_file(Buffer.from(pdfBuffer), output);

      return {
        status: PDFGenerationStatusEnum.success,
        message: PDFGenerationStatusMessages[PDFGenerationStatusEnum.success],
      };
    } catch (error) {
      return {
        status: PDFGenerationStatusEnum.unknown_error,
        message: `Error generating PDF: ${(error as Error).message}`,
      };
    }
  }

  generate_pdfs(
    data: pdf_data[],
    output: string[],
  ): Promise<PDFGeneratedStatus | PDFGeneratedStatus[]> {
    // Implementation here

    return Promise.resolve({
      status: PDFGenerationStatusEnum.success,
      message: "PDFs generated successfully.",
    });
  }
}
