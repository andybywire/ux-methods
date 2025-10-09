import {Plugin as Plugin_2} from 'sanity'
import type {SchemaTypeDefinition} from 'sanity'

/**
 * Sanity plugin definition for the Bulk Delete tool.
 * @public
 */
export declare const BulkDelete: Plugin_2<BulkDeleteToolOptions>

/**
 * Configuration options for the Bulk Delete tool plugin.
 * @public
 */
declare interface BulkDeleteToolOptions {
  /**
   * List of schema types that can be selected for bulk deletion.
   * Typically, these are document types defined in your Sanity schema.
   */
  schemaTypes: SchemaTypeDefinition[]
  /**
   * Optional list of user roles allowed to access and use the Bulk Delete tool.
   * If not specified, only users with the 'administrator' role will have access.
   */
  roles?: string[]
}

export {}
