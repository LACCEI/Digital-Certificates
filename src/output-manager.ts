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
 * Plugin Output Status
 *
 * Enum defining the possible status values for the output of a plugin.
 *
 * @enum {string}
 * @readonly
 * @see CertificatesOutputPlugin
 **/
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

export type PluginConfig = {
  id: string;
  config: { [key: string]: any };
};

export type OutputStatus = {
  plugin_id: string;
  status: string;
  message: string;
};

interface CertificatesOutputManager {
  generateOutput: (
    plugins: [PluginConfig],
    temp_dir: string,
    certificates_data: CertificatesData,
    issue_metadata: { [key: string]: any },
  ) => Array<Promise<OutputStatus>>;
}
