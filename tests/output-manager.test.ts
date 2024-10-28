import CertificatesOutputManager from "../src/output-manager";
import { POStatus } from "../src/output-manager";

function get_absolute_path(relative_path: string): string {
  const path = require("path");
  return path.resolve(__dirname, relative_path);
}

describe("CertificatesOutputManager", () => {
  let outputManager: CertificatesOutputManager;

  beforeEach(() => {
    outputManager = new CertificatesOutputManager({});
  });

  it("should be a class", () => {
    expect(CertificatesOutputManager).toBeInstanceOf(Function);
  });

  it("should have a method set_plugins_dir", () => {
    const outputManager = new CertificatesOutputManager({});
    expect(outputManager.set_plugins_dir).toBeInstanceOf(Function);
  });

  it("should have a method generateOutput", () => {
    const outputManager = new CertificatesOutputManager({});
    expect(outputManager.generateOutput).toBeInstanceOf(Function);
  });

  it("should return an empty array when plugins dir is empty", () => {
    const result = outputManager.generateOutput([], "", [], {});
    expect(result).toEqual([]);
  });

  it("should fail on calling not existing plugin", async () => {
    const results = outputManager.generateOutput(
      [
        {
          id: "does-not-exist",
          config: {},
        },
      ],
      "",
      [],
      {},
    );

    const result = await results[0];

    expect(result.status).toEqual(POStatus.Failure);
    expect(result.message.length).toBeGreaterThan(0);
  });

  it("it should successfully load a plugin director and call a plugin", async () => {
    const plugins_path = get_absolute_path("output-manager/plugins");
    outputManager.set_plugins_dir(plugins_path);
    const results = outputManager.generateOutput(
      [
        {
          id: "test-plugin",
          config: {},
        },
      ],
      "",
      [],
      {},
    );

    const result = await results[0];

    expect(result.status).toEqual(POStatus.Success);
    expect(result.message.length).toBeGreaterThan(0);
  });
});
