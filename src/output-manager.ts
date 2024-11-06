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
import { IssueMetadataType } from "./pdf-gen-definitions";
import fs from "fs";
import path from "path";

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
 * @typedef {Object} PluginOutputStatus
 * @property {POStatus} status - The status of the plugin output.
 * @property {string} message - The message of the plugin output.
 **/
export type PluginOutputStatus = {
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
    // FIXME: Fix comment.
    config: { [key: string]: any },
    pdfs_temp_paths: Array<string>,
    certificates_data: CertificatesData,
    issue_metadata: IssueMetadataType,
  ) => Promise<PluginOutputStatus>;
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
    temp_paths: Array<string>,
    certificates_data: CertificatesData,
    issue_metadata: IssueMetadataType,
  ) => Promise<Array<Promise<OutputStatus>>>;
}

type OutputPluginController = {
  id: string;
  valid: boolean;
  config: { [key: string]: any };
  run_plugin: CertificatesOutputPlugin["run"];
};

class CertificatesOutputManager implements CertificatesOutputManagerInterface {
  private plugins_dir: string = "";

  set_plugins_dir(dir: string): void {
    if (!path.isAbsolute(dir)) {
      dir = path.resolve(dir);
    }

    if (fs.existsSync(dir)) {
      this.plugins_dir = dir;
    } else {
      throw new Error(`Plugins directory does not exist. Path: ${dir}`);
    }
  }

  generateOutput(
    plugins: Array<PluginConfig>,
    temp_paths: Array<string>,
    certificates_data: CertificatesData,
    issue_metadata: IssueMetadataType,
  ): Promise<Array<Promise<OutputStatus>>> {
    return new Promise(async (resolve) => {
      const output_plugins = await this.get_plugins();

      const results: Array<Promise<OutputStatus>> = plugins.map((plugin) => {
        const output_plugin = output_plugins.find(
          (op) => op.id === plugin.id && op.valid,
        );

        return new Promise(async (resolve_plg) => {
          if (output_plugin) {
            let tmp = await output_plugin.run_plugin(
              plugin.config,
              temp_paths,
              certificates_data,
              issue_metadata,
            );

            resolve_plg({
              plugin_id: plugin.id,
              status: tmp.status,
              message: tmp.message,
            });
          } else {
            resolve_plg({
              plugin_id: plugin.id,
              status: POStatus.Failure,
              message: "Plugin not found or invalid.",
            });
          }
        });
      });

      resolve(results);
    });
  }

  private get_plugins(): Promise<Array<OutputPluginController>> {
    return new Promise(async (resolve) => {
      const paths = this.get_plugin_paths();
      const plugins = await Promise.all(paths.map(this.load_plugin));
      resolve(plugins);
    });
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

  private load_plugin(path: string): Promise<OutputPluginController> {
    return new Promise(async (resolve) => {
      const plugin = (await import(path)).default as CertificatesOutputPlugin;
      const config = plugin.getRequiredFields();
      const plugin_id = path.split("/").pop()?.split(".").shift() || path;

      let controller: OutputPluginController = {
        id: plugin_id,
        valid: true,
        config: config,
        run_plugin: plugin["run"],
      };

      for (const key in config) {
        if (!(config[key] in FieldRequirement)) {
          controller.valid = false;
          break;
        }
      }

      if (typeof controller.run_plugin !== "function") {
        controller.valid = false;
      }

      resolve(controller);
    });
  }
}

export default CertificatesOutputManager;
