import DigitalCertificatesManager from "../src/digital-certificates-manager";
import CertificatesOutputManager from "../src/output-manager";
import {
  pdf_data,
  PDFGenerationStatusEnum,
  PDFGenerationStatusMessages,
} from "../src/pdf-gen-definitions";
import PDFGeneration from "../src/pdf-generation";

import path, { resolve } from "path";
import fs from "fs";

jest.mock("../src/output-manager");
jest.mock("../src/pdf-generation");

describe("DigitalCertificatesManager", () => {
  let digitalCertificatesManager: DigitalCertificatesManager;
  const metadata = {
    issuer: "LACCEI",
    title: "Demo Bundle",
    description: "Test PDF bundle.",
  };

  beforeEach(() => {
    digitalCertificatesManager = new DigitalCertificatesManager();
  });

  it("should create PDFs and call output manager", async () => {
    const template = "./templates/test-template1.docx";
    const data = [
      ["name", "date", "course"],
      ["John Doe", "2023-10-01", "Mathematics"],
      ["Jane Smith", "2023-10-02", "Physics"],
      ["Alice Johnson", "2023-10-03", "Chemistry"],
    ];
    const outputPlugins = ["local"];
    const tmpFolder = "./tmp";

    let generate_pdfs_args_recv: {
      pdf_data: pdf_data[];
      output: string[];
    } = {
      pdf_data: [],
      output: [],
    };

    const data_exp: pdf_data[] = data.slice(1).map((row) => {
      return row.map((value, index): [string, string] => [
        data[0][index],
        value,
      ]);
    });

    // jest.spyOn(PDFGeneration, "generate_pdfs").mockResolvedValue();
    (PDFGeneration.prototype.generate_pdfs as jest.Mock).mockImplementation(
      (pdf_data, output) => {
        generate_pdfs_args_recv = { pdf_data, output };
        return new Promise((resolve) => {
          for (let i = 0; i < pdf_data.length; i++) {
            resolve({
              status: PDFGenerationStatusEnum.success,
              message:
                PDFGenerationStatusMessages[PDFGenerationStatusEnum.success],
            });
          }
        });
      },
    );

    digitalCertificatesManager.generate_certificates(
      template,
      data,
      outputPlugins,
      tmpFolder,
      metadata,
    );

    expect(generate_pdfs_args_recv.pdf_data).toEqual(data_exp);

    const set_templateMock = (PDFGeneration as jest.Mock<PDFGeneration>).mock
      .instances[0].set_template;

    expect(set_templateMock).toHaveBeenCalledWith(template);

    // const generate_pdfsMock = (
    //   PDFGeneration as jest.Mock<PDFGeneration>
    // ).mock.instances[0].generate_pdfs;

    // expect(generate_pdfsMock).toHaveBeenCalledWith(data, tmpFolder);
  });
});
