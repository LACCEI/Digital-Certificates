import CertificatesOutputManager from "../src/output-manager";
import { POStatus } from "../src/output-manager";
import { IssueMetadataType } from "../src/pdf-gen-definitions";
import fs from "fs";
import path from "path";

function get_absolute_path(relative_path: string): string {
  return path.resolve(__dirname, relative_path);
}

function get_sample_issue_metadata(): IssueMetadataType {
  return {
    issue_timestamp: new Date().toISOString(),
    others: {
      event_title: "Sample Event",
    },
  };
}

describe("CertificatesOutputManager", () => {
  let outputManager: CertificatesOutputManager;

  beforeEach(() => {
    outputManager = new CertificatesOutputManager();
  });

  it("should be a class", () => {
    expect(CertificatesOutputManager).toBeInstanceOf(Function);
  });

  it("should have a method set_plugins_dir", () => {
    const outputManager = new CertificatesOutputManager();
    expect(outputManager.set_plugins_dir).toBeInstanceOf(Function);
  });

  it("should have a method generateOutput", () => {
    const outputManager = new CertificatesOutputManager();
    expect(outputManager.generateOutput).toBeInstanceOf(Function);
  });

  it("should throw an error when plugins dir is not set", () => {
    const outputManager = new CertificatesOutputManager();
    expect(() => {
      outputManager.set_plugins_dir("/not-existing-dir");
      outputManager.generateOutput([], "", [], get_sample_issue_metadata());
    }).toThrow(Error);
  });

  it("should return an empty array when plugins dir is empty", async () => {
    let empty_folder = "./output-manager/empty-plugins-dir";
    empty_folder = get_absolute_path(empty_folder);
    if (!fs.existsSync(empty_folder)) {
      fs.mkdirSync(empty_folder, { recursive: true });
    }

    outputManager.set_plugins_dir(empty_folder);
    const result = await outputManager.generateOutput(
      [],
      "",
      [],
      get_sample_issue_metadata(),
    );
    expect(result).toEqual([]);
  });

  it("should fail on calling not existing plugin", async () => {
    let sample_plugins = "./output-manager/empty-plugins-dir";
    sample_plugins = get_absolute_path(sample_plugins);
    outputManager.set_plugins_dir(sample_plugins);
    const results = await outputManager.generateOutput(
      [
        {
          id: "does-not-exist",
          config: {},
        },
      ],
      "",
      [],
      get_sample_issue_metadata(),
    );

    const result = await results[0];

    expect(result.status).toEqual(POStatus.Failure);
    expect(result.message.length).toBeGreaterThan(0);
  });

  it("it should successfully load a plugin directory and call a plugin", async () => {
    const plugins_path = get_absolute_path("output-manager/sample-plugins");
    outputManager.set_plugins_dir(plugins_path);
    const results = await outputManager.generateOutput(
      [
        {
          id: "test-plugin",
          config: {},
        },
      ],
      "",
      [],
      get_sample_issue_metadata(),
    );

    const result = await results[0];

    expect(result.status).toEqual(POStatus.Success);
    expect(result.message.length).toBeGreaterThan(0);
  });
});
