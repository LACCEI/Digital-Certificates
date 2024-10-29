/**
 * @file Certificates Output Manager
 *
 * This module is responsible for managing the output of certificates. It
 * handles the loading of plugins, provides the appropriate required
 * configurations, and invokes the plugins upon request.
 *
 * This module contains types and interfaces for the plugins.
 *
 * The Certificates Output Manager is a crucial part of the original design,
 * ensuring that the correct plugins are used and that they are configured
 * properly to generate the desired output.
 **/

import { CertificatesData } from "./digital-certificates-manager";
import fs from "fs";

/**
 * Field Requirement
 *
 * Enum defining the requirement level of a field in the configuration.
 *
 * @enum {number}
 * @readonly
 * @see ConfigFields
 * @see CertificatesOutputPlugin
 **/
export enum FieldRequirement {
  Required,
  Optional,
}

/**
 * Configuration Fields
 *
 * Object defining the configuration fields required by a plugin. They can only
 * be one-level deep, with the key being the field name and the value being the
 * requirement level.
 *
 * @typedef {Object.<string, FieldRequirement>} ConfigFields
 * @see FieldRequirement
 * @see CertificatesOutputPlugin
 **/
export type ConfigFields = { [key: string]: FieldRequirement };

/**
 * Enum representing the status of a plugin output operation.
 *
 * @enum {number}
 * @property {number} Success - Plugin ran successfully.
 * @property {number} Warning - Plugin ran with issues, but non-fatal.
 * @property {number} Failure - Plugin didn't run. It had fatal issues.
 */
export enum POStatus {
  Success, // Plugin ran successfully.
  Warning, // Plugin ran with issues, but non-fatal.
  Failure, // Plugin didn't ran. It had fatal issues.
}

/**
 * Plugin Output Status Type
 *
 * Pluging must return this type of object as the output status when called to
 * generate output.
 *
 * @typedef {Object} PluginOuputStatus
 * @property {POStatus} status - The status of the plugin output.
 * @property {string} message - The message of the plugin output.
 **/
export type PluginOuputStatus = {
  status: POStatus;
  message: string;
};

/**
 * Certificates Output Plugin
 *
 * Interface defining the methods required by a certificates output plugin.
 *
 * @interface CertificatesOutputPlugin
 * @see ConfigFields
 **/
export interface CertificatesOutputPlugin {
  /**
   * Get Required Fields
   *
   * Method to retrieve the required configuration fields for the plugin.
   *
   * @returns {ConfigFields} The required configuration fields.
   **/
  getRequiredFields: () => ConfigFields;

  /**
   * Run
   *
   * Method to run the plugin and generate the output.
   *
   * @param {Object.<string, any>} config - The configuration for the plugin.
   * @param {string} pdfs_temp_dir - The directory containing the PDFs.
   * @param {CertificatesData} certificates_data - The data for the
   * certificates.
   **/
  run: (
    config: { [key: string]: any },
    pdfs_temp_dir: string,
    certificates_data: CertificatesData,
  ) => Promise<PluginOuputStatus>;
}

/**
 * Represents the configuration for a plugin.
 *
 * @typedef {Object} PluginConfig
 * @property {string} id - The unique identifier for the plugin.
 * @property {Object.<string, any>} config - A key-value pair object containing
 * the plugin's configuration settings.
 **/
export type PluginConfig = {
  id: string;
  config: { [key: string]: any };
};

/**
 * Represents the status of an output operation.
 *
 * @typedef {Object} OutputStatus
 * @property {string} plugin_id - The identifier of the plugin.
 * @property {string} status - The status of the output operation.
 * @property {string} message - A message providing additional details about
 *                              the status.
 **/
export type OutputStatus = {
  plugin_id: string;
  status: POStatus;
  message: string;
};

/**
 * Interface representing a manager for generating certificate outputs.
 **/
interface CertificatesOutputManagerInterface {
  /**
   * Set the directory where the plugins are located.
   *
   * @param dir - The directory where the plugins are located.
   **/
  set_plugins_dir: (dir: string) => void;

  /**
   * Send the output certifcates along with data and metadata to the instructed
   * plugins (as long as they were successfully loaded).
   *
   * @param plugins - An array containing the configuration for the plugins to
   *                  be used.
   * @param temp_dir - The temporary directory where the PDF certificate files
   *                   exist and can be accessed by the plugin.
   * @param certificates_data - The data related to the certificates to be
   *                            processed (e.g., PDF file name of each
   *                            certificate).
   * @param issue_metadata - Additional metadata related to the certificate
   *                         issuance (e.g., processed date, issue date, etc.).
   *
   * @returns An array of promises, each resolving to the status of the output
   *          of each plugin.
   **/
  generateOutput: (
    plugins: Array<PluginConfig>,
    temp_dir: string,
    certificates_data: CertificatesData,
    issue_metadata: { [key: string]: any },
  ) => Array<Promise<OutputStatus>>;
}

class CertificatesOutputManager implements CertificatesOutputManagerInterface {
  private plugins: { [id: string]: CertificatesOutputPlugin };
  private plugins_dir: string = "";

  constructor(plugins: { [id: string]: CertificatesOutputPlugin }) {
    this.plugins = plugins;
  }

  set_plugins_dir(dir: string): void {
    if (!dir.startsWith("/")) {
      dir = `${process.cwd()}/${dir}`;
    }

    if (fs.existsSync(dir)) {
      this.plugins_dir = dir;
      throw new Error("Directory does not exist.");
    }
  }

  generateOutput(
    plugins: Array<PluginConfig>,
    temp_dir: string,
    certificates_data: CertificatesData,
    issue_metadata: { [key: string]: any },
  ): Array<Promise<OutputStatus>> {
    return [];
  }

  private get_plugin_paths(): Array<string> {
    if (!this.plugins_dir) {
      throw new Error("Plugins directory is not set.");
    }

    const files = fs.readdirSync(this.plugins_dir);
    return files
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
      .map((file) => `${this.plugins_dir}/${file}`);
  }

  private load_plugin(id: string): CertificatesOutputPlugin {
    // FIXME: Pending implementation.
    return this.plugins[id];
  }
}

export default CertificatesOutputManager;
