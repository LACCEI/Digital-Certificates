import DigitalCertificatesAPI from "../src/digital-certificates-api";

describe("DigitalCertificatesAPI", () => {
  let digitalCertificatesAPI: DigitalCertificatesAPI;

  beforeEach(() => {
    digitalCertificatesAPI = new DigitalCertificatesAPI();
  });

  describe("generate_certificates", () => {
    it("should be defined", () => {
      expect(digitalCertificatesAPI.generate_certificates).toBeDefined();
    });

    it("should be a function", () => {
      expect(typeof digitalCertificatesAPI.generate_certificates).toBe("function");
    });
  });
});