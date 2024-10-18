import {
  PdfGenerationInterface,
  proc_config,
  pdf_data,
  PDFGeneratedStatus,
  PDFGenerationStatusEnum,
} from "./pdf-gen-definitions";

export default class PdfGeneration implements PdfGenerationInterface {
  set_template(template: string): void {
    // Implementation here
  }

  set_proc_config(config: proc_config): void {
    // Implementation here
  }

  set_constants(constants: pdf_data): void {
    // Implementation here
  }

  generate_pdf(data: pdf_data, output: string): PDFGeneratedStatus {
    // Implementation here

    return {
      status: PDFGenerationStatusEnum.success,
      message: "PDF generated successfully.",
    };
  }

  generate_pdfs(data: pdf_data[], output: string): PDFGeneratedStatus {
    // Implementation here

    return {
      status: PDFGenerationStatusEnum.success,
      message: "PDFs generated successfully.",
    };
  }
}
