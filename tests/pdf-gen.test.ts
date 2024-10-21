import PdfGeneration from "../src/pdf-generation";
import {
  PDFGeneratedStatus,
  PDFGenerationStatusEnum,
  PDFGenerationStatusMessages,
  proc_config,
  pdf_data
} from "../src/pdf-gen-definitions"

function compareFiles(file1: string, file2: string): boolean {
  const fs = require("fs");
  const f1 = fs.readFileSync(file1, "utf8");
  const f2 = fs.readFileSync(file2, "utf8");
  return f1 === f2;
}

describe("PdfGeneration", () => {
  let pdfGen: PdfGeneration;
  
  const dirs = {
    templates: "templates",
    output: "output",
    expected: "expected",
  };

  const singleDataSample: pdf_data = [
    ["name", "John Doe"],
    ["date", "2023-10-01"],
    ["course", "Introduction to TypeScript"],
  ];

  beforeEach(() => {
    pdfGen = new PdfGeneration();
  });

  it("should return a missing template path error", () => {    
    const output = "test-template1.pdf";
    const status = pdfGen.generate_pdf(singleDataSample, `${dirs.output}/${output}`);
    
    expect(status.status).toEqual(PDFGenerationStatusEnum.missing_template_path);
    expect(status.message).toEqual(PDFGenerationStatusMessages[PDFGenerationStatusEnum.missing_template_path]);
  });

  it("should return missing template file error", () => {
    const output = "test-template1.pdf";
    const status = pdfGen.generate_pdf(singleDataSample, `${dirs.output}/${output}`);
    
    expect(status.status).toEqual(PDFGenerationStatusEnum.missing_template_path);
    expect(status.message).toEqual(PDFGenerationStatusMessages[PDFGenerationStatusEnum.missing_template_path]);
  });

  it("should generate a PDF", () => {
    const files = {
      template: `${dirs.templates}/test-template1.docx`,
      expected: `${dirs.expected}/test-template1.pdf`,
      output: `${dirs.output}/test-template1.pdf`,
    }

    pdfGen.set_template(files.template);
    const status: PDFGeneratedStatus = pdfGen.generate_pdf(singleDataSample, `${dirs.output}/test-template1.pdf`);
    
    expect(status.status).toEqual(PDFGenerationStatusEnum.success);
    expect(status.message).toEqual(PDFGenerationStatusMessages[PDFGenerationStatusEnum.success]);
    expect(compareFiles(files.output, files.expected)).toBeTruthy();
  });

 /*  it("should generate a PDF using constants", () => {
    const data = [
      ["date", "2023-10-01"],
      ["course", "Introduction to TypeScript"],
    ];
    const output = "output.pdf";
    const constants = [
      ["name", "John Doe"],
    ];
    pdfGen.set_constants(constants);
    const status = pdfGen.generate_pdf(data, output);
    expect(status.status).toEqual("success");
    expect(status.message).toEqual("PDF generated successfully.");
  });

  it("should generate PDFs", () => {
    const data = [
      [
        ["name", "John Doe"],
        ["date", "2023-10-01"],
        ["course", "Introduction to TypeScript"],
      ],
      [
        ["name", "Jane Doe"],
        ["date", "2023-10-02"],
        ["course", "Advanced TypeScript"],
      ],
    ];
    const output = "output.pdf";
    const status = pdfGen.generate_pdfs(data, output);
    expect(status.status).toEqual("success");
    expect(status.message).toEqual("PDFs generated successfully.");
  }); */
});