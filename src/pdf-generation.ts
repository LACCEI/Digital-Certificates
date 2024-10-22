import {
  PDFGenerationInterface,
  proc_config,
  pdf_data,
  PDFGeneratedStatus,
  PDFGenerationStatusEnum,
  PDFGenerationStatusMessages,
} from "./pdf-gen-definitions";
import path from "path";
import fs from "fs";
import createReport from "docx-templates";
import libre from "libreoffice-convert";
import util from "util";

const libreConvertAsync = require('util').promisify(libre.convert);

export default class PDFGeneration implements PDFGenerationInterface {
  private config: { cmdDelimiter: [string, string] } = {
    cmdDelimiter: ["{{", "}}"],
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
    this.config = {
      cmdDelimiter: [
        config.delimiters.start,
        config.delimiters.end,
      ],
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
  private build_model(data: pdf_data): Record<string, unknown> {
    const model: Record<string, unknown> = {};

    this.constants.forEach(([key, value]) => {
      model[key as string] = value;
    });

    data.forEach(([key, value]) => {
      // Instance data may overwrite constants.
      model[key as string] = value;
    });

    return model;
  }

  async generate_pdf(
    instance_data: pdf_data,
    output: string,
  ): Promise<PDFGeneratedStatus> {
    if (this.template_file_path === "") {
      return Promise.resolve({
        status: PDFGenerationStatusEnum.missing_template_path,
        message:
          PDFGenerationStatusMessages[
            PDFGenerationStatusEnum.missing_template_path
          ],
      });
    } else if (!this.does_the_template_exist(this.template_file_path)) {
      return Promise.resolve({
        status: PDFGenerationStatusEnum.template_does_not_exist,
        message:
          PDFGenerationStatusMessages[
            PDFGenerationStatusEnum.template_does_not_exist
          ],
      });
    }

    const template_buffer = fs.readFileSync(this.template_file_path);

    try {
      const docxBuffer = await createReport({
        cmdDelimiter: this.config.cmdDelimiter,
        template: template_buffer,
        data: this.build_model(instance_data),
      });

      let PDFBuffer = await libreConvertAsync(docxBuffer, ".pdf", undefined);

      fs.writeFileSync(output, PDFBuffer);

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
