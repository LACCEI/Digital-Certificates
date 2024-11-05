import DigitalCertificatesAPI from "../src/digital-certificates-api";
import DigitalCertificatesManager from "../src/digital-certificates-manager";
import path from "path";
import fs from "fs";

jest.mock("../src/digital-certificates-manager");

describe("DigitalCertificatesAPI", () => {
  let digitalCertificatesAPI: DigitalCertificatesAPI;

  beforeEach(() => {
    (
      DigitalCertificatesManager as jest.Mock<DigitalCertificatesManager>
    ).mockClear();
    digitalCertificatesAPI = new DigitalCertificatesAPI();
  });

  describe("load CSV files", () => {
    it("should be defined", () => {
      expect(digitalCertificatesAPI.generate_certificates).toBeDefined();
    });

    it("should load data correctly from CSV file", async () => {
      const simple_csv_file_path = path.resolve(
        __dirname,
        "./sample-files/simple-list.csv",
      );
      const csvContent = `name,date,course\nJohn Doe,2023-10-01,Mathematics\nJane Smith,2023-10-02,Physics\nAlice Johnson,2023-10-03,Chemistry`;
      const template_filepath = path.resolve(
        __dirname,
        "./templates/test-template1.docx",
      );

      expect(DigitalCertificatesManager).not.toHaveBeenCalled();

      jest.spyOn(fs, "readFileSync").mockReturnValue(csvContent);

      await digitalCertificatesAPI.generate_certificates(
        simple_csv_file_path,
        template_filepath,
        [],
      );

      const generate_certificatesMock = (
        DigitalCertificatesManager as jest.Mock<DigitalCertificatesManager>
      ).mock.instances[0].generate_certificates;

      expect(generate_certificatesMock).toHaveBeenCalledWith(
        template_filepath,
        [
          ["name", "date", "course"],
          ["John Doe", "2023-10-01", "Mathematics"],
          ["Jane Smith", "2023-10-02", "Physics"],
          ["Alice Johnson", "2023-10-03", "Chemistry"],
        ],
        [],
      );
      expect(generate_certificatesMock).toHaveBeenCalledTimes(1);
    });
  });
});

describe("load Excel files", () => {
  let digitalCertificatesAPI: DigitalCertificatesAPI;

  beforeEach(() => {
    (
      DigitalCertificatesManager as jest.Mock<DigitalCertificatesManager>
    ).mockClear();
    digitalCertificatesAPI = new DigitalCertificatesAPI();
  });

  it("should load data correctly from Excel file", async () => {
    const simple_excel_file_path = path.resolve(
      __dirname,
      "./sample-files/simple-list.xlsx",
    );

    const template_filepath = path.resolve(
      __dirname,
      "./templates/test-template1.docx",
    );

    expect(DigitalCertificatesManager).not.toHaveBeenCalled();

    await digitalCertificatesAPI.generate_certificates(
      simple_excel_file_path,
      template_filepath,
      [],
    );

    const generate_certificatesMock = (
      DigitalCertificatesManager as jest.Mock<DigitalCertificatesManager>
    ).mock.instances[0].generate_certificates;

    expect(generate_certificatesMock).toHaveBeenCalledWith(
      template_filepath,
      [
        ["name", "date", "course"],
        ["John Doe", "2023-10-01", "Mathematics"],
        ["Jane Smith", "2023-10-02", "Physics"],
        ["Alice Johnson", "2023-10-03", "Chemistry"],
      ],
      [],
    );
    expect(generate_certificatesMock).toHaveBeenCalledTimes(1);
  });
});
