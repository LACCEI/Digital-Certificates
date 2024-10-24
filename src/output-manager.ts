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
 ***/

/**
 * Field Requirement
 *
 * Enum defining the requirement level of a field in the configuration.
 *
 * @enum {number}
 * @readonly
 * @see ConfigFields
 * @see CertificatesOutputPlugin
 ***/
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
  
  run: (
    config: { [key: string]: any },
    pdfs_temp_dir: string,
    certificates_data: { [key: string]: any }[],
  ) => void;
}