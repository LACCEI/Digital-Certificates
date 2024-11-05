/**
 * @file Digital Certificates API
 *
 * This file was initially called Data Bundler in the design, but now it is the
 * Digital Certificates API. It serves as the interface that third-party
 * applications would use to interact with the module. It also takes care of
 * processing the input and converting it into the format required by the
 * internal modules (e.g., CSV or Excel into 2D array).
 **/

import fs from "fs";
import path from "path";
import { CertificatesData } from "./digital-certificates-manager";
import DigitalCertificatesManager, {
  GenerationStatus,
} from "./digital-certificates-manager";
import { output_plugins_data_type } from "./pdf-gen-definitions";
import csvParser from "csv-parser";
import ExcelJS from "exceljs";

/**
 * Interface representing the Digital Certificates API.
 **/
interface DigitalCertificatesAPIInterface {
  /**
   * Generates digital certificates for the given recipients using the
   * specified template and output plugins.
   *
   * The recipients' data is read from the file specified by the `recipients`
   * parameter. The file must be in CSV format. Excel format is not supported
   * yet.
   *
   * If the recipients or the template_docx file does not exist, an error is
   * thrown.
   *
   * @param recipients - Path to the file containing the recipients' data.
   * @param template_docx - Path to the DOCX template file.
   * @param output_plugins - An array of strings specifying the output plugins
   *                         to be used.
   * @param tmp_folder - Path to the temporary folder for intermediate files.
   * @returns A promise that resolves to a GenerationStatus object when the
   *          certificates are generated.
   **/
  generate_certificates: (
    recipients: string,
    template_docx: string,
    output_plugins: Array<string>,
    tmp_folder: string,
    output_plugins_data: output_plugins_data_type,
    bundle_metadata: any,
  ) => Promise<GenerationStatus>; // FIXME: What should it resolve to?
}

export default class DigitalCertificatesAPI
  implements DigitalCertificatesAPIInterface
{
  generate_certificates(
    recipients: string,
    template_docx: string,
    output_plugins: Array<string>,
    tmp_folder: string = "./tmp",
    output_plugins_data: output_plugins_data_type = {},
    bundle_metadata: any = {},
  ): Promise<GenerationStatus> {
    return new Promise((resolve, reject) => {
      if (!path.isAbsolute(recipients)) {
        recipients = path.resolve(recipients); // FIXME: Add tests to check if this work even if absolute paths are provided.
      }

      if (!path.isAbsolute(tmp_folder)) {
        tmp_folder = path.resolve(__dirname, tmp_folder);
      }

      template_docx = path.isAbsolute(template_docx)
        ? template_docx
        : path.resolve(template_docx);

      if (!fs.existsSync(template_docx)) {
        reject(new Error(`Template file ${template_docx} does not exist.`));
      } else if (!fs.existsSync(recipients)) {
        reject(new Error(`Recipients file ${recipients} does not exist.`));
      }

      const parser = this.get_parser(recipients);
      const manager = new DigitalCertificatesManager();

      this.create_tmp_folder(tmp_folder);

      parser.read(recipients, {}).then(async (data: CertificatesData) => {
        let gen_status = await manager.generate_certificates(
          template_docx,
          data,
          output_plugins,
          output_plugins_data,
          bundle_metadata,
          tmp_folder,
        );
        resolve(gen_status);
      });
    });
  }

  private get_parser(recipients: string): RecipientsFileParserInterface {
    const ext = recipients.split(".").pop();
    if (ext === "csv") {
      return new CSVParser();
    } else if (ext === "xlsx") {
      // throw new Error("Excel format not supported yet.");
      return new ExcelParser();
    } else {
      throw new Error("Unsupported file format.");
    }
  }

  private create_tmp_folder(tmp_folder: string): void {
    if (!fs.existsSync(tmp_folder)) {
      fs.mkdirSync(tmp_folder);
    }
  }
}

interface RecipientsFileParserInterface {
  read: (recipients: string, config: any) => Promise<CertificatesData>;
}

class CSVParser implements RecipientsFileParserInterface {
  read(
    recipients: string,
    config = {
      escape: '"',
      // [headers: Array<string>|boolean]: [],
      newline: "\n",
      quote: '"',
      separator: ",", // delimiter
    },
  ): Promise<CertificatesData> {
    return new Promise((resolve) => {
      let output_data: CertificatesData = [];
      let temp: Array<string> = [];
      fs.createReadStream(recipients)
        .pipe(csvParser(config))
        .on("data", (data: any) => {
          temp.push(data);
        })
        .on("end", () => {
          output_data.push(Object.keys(temp[0]));
          temp.forEach((row: any) => {
            output_data.push(Object.values(row));
          });
          resolve(output_data);
        });
    });
  }
}

class ExcelParser implements RecipientsFileParserInterface {
  read(
    recipients: string,
    config: {
      target_sheet?: string;
    } = {},
  ): Promise<CertificatesData> {
    return new Promise(async (resolve) => {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(recipients);

      const worksheet = workbook.worksheets[0]; // FIXME: Must be a different behavior if the target_sheet is specified.
      const data: CertificatesData = [];

      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        const rowData: Array<string> = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          // Evaluate formulas and get the calculated value
          const cellValue: string = cell.formula
            ? String(cell.result)
            : String(cell.value);
          rowData.push(cellValue);
        });
        data.push(rowData);
      });

      resolve(data);
    });
  }
}
