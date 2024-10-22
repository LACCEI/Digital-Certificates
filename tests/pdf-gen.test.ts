import PDFGeneration from "../src/pdf-generation";
import {
  PDFGeneratedStatus,
  PDFGenerationStatusEnum,
  PDFGenerationStatusMessages,
  proc_config,
  pdf_data,
} from "../src/pdf-gen-definitions";
import path from "path";

function get_absolute_path(filePath: string): string {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(__dirname, filePath);
  return absolutePath;
}

function compareFiles(file1: string, file2: string): boolean {
  const file1_path = get_absolute_path(file1);
  const file2_path = get_absolute_path(file2);
  const fs = require("fs");
  const f1 = fs.readFileSync(file1_path, "utf8");
  const f2 = fs.readFileSync(file2_path, "utf8");
  return f1 === f2;
}

describe("PDFGeneration - Working with one document", () => {
  let pdfGen: PDFGeneration;

  const dirs = {
    templates: "../tests/templates",
    output: "../tests/output",
    expected: "../tests/expected",
  };

  const singleDataSample: pdf_data = [
    ["name", "John Doe"],
    ["date", "2023-10-01"],
    ["course", "Introduction to TypeScript"],
  ];

  beforeEach(() => {
    pdfGen = new PDFGeneration();
  });

  it("should return a missing template path error", async () => {
    const output = "test-template1.pdf";
    const status = await pdfGen.generate_pdf(
      singleDataSample,
      `${dirs.output}/${output}`,
    );

    expect(status.status).toEqual(
      PDFGenerationStatusEnum.missing_template_path,
    );
    expect(status.message).toEqual(
      PDFGenerationStatusMessages[
        PDFGenerationStatusEnum.missing_template_path
      ],
    );
  });

  it("should return missing template file error", async () => {
    const output = "test-template1.pdf";

    pdfGen.set_template(`${dirs.templates}/does-not-exist.docx`);
    const status = await pdfGen.generate_pdf(
      singleDataSample,
      `${dirs.output}/${output}`,
    );

    expect(status.status).toEqual(
      PDFGenerationStatusEnum.template_does_not_exist,
    );
    expect(status.message).toEqual(
      PDFGenerationStatusMessages[
        PDFGenerationStatusEnum.template_does_not_exist
      ],
    );
  });

  it("should return missing field error", async () => {
    const files = {
      template: `${dirs.templates}/test-template1.docx`,
      output: `${dirs.output}/test-template1.pdf`,
    };

    const data: pdf_data = [
      ["name", "John Doe"],
      ["date", "2023-10-01"],
    ];

    pdfGen.set_template(files.template);
    const status: PDFGeneratedStatus = await pdfGen.generate_pdf(
      data,
      files.output,
    );

    expect(status.status).toEqual(PDFGenerationStatusEnum.missing_fields);
    expect(status.message).toEqual(
      PDFGenerationStatusMessages[PDFGenerationStatusEnum.missing_fields],
    );
  });

  it("should return extra fields error", async () => {
    const files = {
      template: `${dirs.templates}/test-template1.docx`,
      output: `${dirs.output}/test-template1.pdf`,
    };

    const data: pdf_data = [
      ["name", "John Doe"],
      ["date", "2023-10-01"],
      ["course", "Introduction to TypeScript"],
      ["extra", "Extra field"],
    ];

    pdfGen.set_template(files.template);
    const status: PDFGeneratedStatus = await pdfGen.generate_pdf(
      data,
      files.output,
    );

    expect(status.status).toEqual(PDFGenerationStatusEnum.extra_fields);
    expect(status.message).toEqual(
      PDFGenerationStatusMessages[PDFGenerationStatusEnum.extra_fields],
    );
  });

  it("should generate a PDF using default config", async () => {
    const files = {
      template: `${dirs.templates}/test-template1.docx`,
      // expected: `${dirs.expected}/test-template1.pdf`,
      output: `${dirs.output}/test-template1.pdf`,
    };

    pdfGen.set_template(files.template);
    const status: PDFGeneratedStatus = await pdfGen.generate_pdf(
      singleDataSample,
      files.output,
    );

    expect(status.status).toEqual(PDFGenerationStatusEnum.success);
    expect(status.message).toEqual(
      PDFGenerationStatusMessages[PDFGenerationStatusEnum.success],
    );
    // expect(compareFiles(files.output, files.expected)).toBeTruthy();
  });

  it("should generate a PDF using constants", async () => {
    const files = {
      template: `${dirs.templates}/test-template1.docx`,
      // expected: `${dirs.expected}/test-template1.pdf`,
      output: `${dirs.output}/test-template1.pdf`,
    };

    const constants: pdf_data = [["course", "Introduction to TypeScript"]];

    const data: pdf_data = [
      ["name", "John Doe"],
      ["date", "2023-10-01"],
    ];

    pdfGen.set_template(files.template);
    pdfGen.set_constants(constants);

    const status: PDFGeneratedStatus = await pdfGen.generate_pdf(
      data,
      files.output,
    );

    expect(status.status).toEqual(PDFGenerationStatusEnum.success);
    expect(status.message).toEqual(
      PDFGenerationStatusMessages[PDFGenerationStatusEnum.success],
    );
    // expect(compareFiles(files.output, files.expected)).toBeTruthy();
  });

  it("should generate a PDF using custom configuration", async () => {
    const files = {
      template: `${dirs.templates}/test-template2.docx`,
      // expected: `${dirs.expected}/test-template1.pdf`,
      output: `${dirs.output}/test-template2.pdf`,
    };

    const config: proc_config = {
      delimiters: {
        start: "<<",
        end: ">>",
      },
    };

    const data: pdf_data = [
      ["name", "John Doe"],
      ["date", "2023-10-01"],
      ["course", "Introduction to TypeScript"],
    ];

    pdfGen.set_template(files.template);
    pdfGen.set_proc_config(config);

    const status: PDFGeneratedStatus = await pdfGen.generate_pdf(
      data,
      files.output,
    );

    expect(status.status).toEqual(PDFGenerationStatusEnum.success);
    expect(status.message).toEqual(
      PDFGenerationStatusMessages[PDFGenerationStatusEnum.success],
    );
    // expect(compareFiles(files.output, files.expected)).toBeTruthy();
  });
});

describe("PDFGeneration - Working with multiple documents", () => {
  let pdfGen: PDFGeneration;

  const dirs = {
    templates: "../tests/templates",
    output: "../tests/output",
    expected: "../tests/expected",
  };

  const multipleDataSample: pdf_data[] = [
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

  beforeEach(() => {
    pdfGen = new PDFGeneration();
  });

  it("should return a missing template path error", async () => {
    const output = "test-multiple-output1.pdf";
    const status = await pdfGen.generate_pdfs(multipleDataSample, [
      `${dirs.output}/${output}`,
    ]);

    if (!Array.isArray(status)) {
      expect(status.status).toEqual(
        PDFGenerationStatusEnum.missing_template_path,
      );
      expect(status.message).toEqual(
        PDFGenerationStatusMessages[
          PDFGenerationStatusEnum.missing_template_path
        ],
      );
    } else {
      fail("An array was returned. Expected a single status.");
    }
  });

  it("should return missing template file error", async () => {
    const output = "test-multiple-output1.pdf";

    pdfGen.set_template(`${dirs.templates}/does-not-exist.docx`);
    const status = await pdfGen.generate_pdfs(multipleDataSample, [
      `${dirs.output}/${output}`,
    ]);

    if (!Array.isArray(status)) {
      expect(status.status).toEqual(
        PDFGenerationStatusEnum.template_does_not_exist,
      );
      expect(status.message).toEqual(
        PDFGenerationStatusMessages[
          PDFGenerationStatusEnum.template_does_not_exist
        ],
      );
    } else {
      fail("An array was returned. Expected a single status.");
    }
  });

  it("should return a missing field error", async () => {
    const data: pdf_data[] = [
      ...multipleDataSample,
      [
        ["name", "John Doe"],
        ["date", "2023-10-01"],
      ],
    ];

    const files = {
      template: `${dirs.templates}/test-template1.docx`,
      output: data.map(
        (_, i) => `${dirs.output}/test-multiple-output-test1-${i}.pdf`,
      ),
    };

    pdfGen.set_template(files.template);
    const status = await pdfGen.generate_pdfs(data, files.output);

    const expected_outputs = [
      PDFGenerationStatusEnum.success,
      PDFGenerationStatusEnum.success,
      PDFGenerationStatusEnum.missing_fields,
    ];

    const expected_messages = [
      PDFGenerationStatusMessages[PDFGenerationStatusEnum.success],
      PDFGenerationStatusMessages[PDFGenerationStatusEnum.success],
      PDFGenerationStatusMessages[PDFGenerationStatusEnum.missing_fields],
    ];

    if (Array.isArray(status) && status.length === 3) {
      status.forEach((s, i) => {
        expect(s.status).toEqual(expected_outputs[i]);
        expect(s.message).toEqual(expected_messages[i]);
      });
    } else {
      fail("Expected an array of statuses of length 3.");
    }
  });

  it("should return extra fields error", async () => {
    const files = {
      template: `${dirs.templates}/test-template1.docx`,
      output: multipleDataSample.map(
        (_, i) => `${dirs.output}/test-multiple-output-test2-${i}.pdf`,
      ),
    };

    const data: pdf_data[] = [
      ...multipleDataSample,
      [
        ["name", "John Doe"],
        ["date", "2023-10-01"],
        ["course", "Introduction to TypeScript"],
        ["extra", "Extra field"],
      ],
    ];

    pdfGen.set_template(files.template);
    const status = await pdfGen.generate_pdfs(data, files.output);

    const expected_outputs = [
      PDFGenerationStatusEnum.success,
      PDFGenerationStatusEnum.success,
      PDFGenerationStatusEnum.extra_fields,
    ];

    const expected_messages = [
      PDFGenerationStatusMessages[PDFGenerationStatusEnum.success],
      PDFGenerationStatusMessages[PDFGenerationStatusEnum.success],
      PDFGenerationStatusMessages[PDFGenerationStatusEnum.extra_fields],
    ];

    if (Array.isArray(status) && status.length === 3) {
      status.forEach((s, i) => {
        expect(s.status).toEqual(expected_outputs[i]);
        expect(s.message).toEqual(expected_messages[i]);
      });
    } else {
      fail("Expected an array of statuses of length 3.");
    }
  });

  it("should generate PDFs", async () => {
    const files = {
      template: `${dirs.templates}/test-template1.docx`,
      // expected: `${dirs.expected}/test-template1.pdf`,
      output: multipleDataSample.map(
        (_, i) => `${dirs.output}/test-multiple-output-test3-${i}.pdf`,
      ),
    };

    pdfGen.set_template(files.template);
    const status = await pdfGen.generate_pdfs(multipleDataSample, files.output);

    const expected_outputs = [
      PDFGenerationStatusEnum.success,
      PDFGenerationStatusEnum.success,
    ];

    const expected_messages = [
      PDFGenerationStatusMessages[PDFGenerationStatusEnum.success],
      PDFGenerationStatusMessages[PDFGenerationStatusEnum.success],
    ];

    if (Array.isArray(status) && status.length === 2) {
      status.forEach((s, i) => {
        expect(s.status).toEqual(expected_outputs[i]);
        expect(s.message).toEqual(expected_messages[i]);
        // expect(compareFiles(files.output[i], files.expected)).toBeTruthy();
      });
    } else {
      fail("Expected an array of statuses of length 2.");
    }
  });
});
