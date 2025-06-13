import {ArrayFieldProps} from 'sanity'
import {FieldDefinition} from 'sanity'
import {JSX as JSX_2} from 'react'
import {ObjectFieldProps} from 'sanity'
import {Plugin as Plugin_2} from 'sanity'
import {Reference} from 'sanity'

/**
 * Hierarchy View Input Component
 *
 * This component allows Studio users to browse and select taxonomy
 * terms from a hierarchical tree structure. It is designed to be
 * used as an input for taxonomy array fields in Sanity Studio.
 *
 * Hierarchy view must be used in conjunction with the Taxonomy Manager
 * plugin `schemeFilter` or `branchFilter` options.
 *
 */
export declare function ArrayHierarchyInput(props: ArrayFieldProps): JSX_2.Element

/**
 * #### Reference Field Scheme & Branch Filter
 * A pluggable Function for Filtering to a Top Concept Branch within a SKOS Concept Scheme
 * @param schemeId - The unique six character concept identifier for the Concept Scheme to which you wish to filter.
 * @param branchId - The unique six character concept identifier of a branch. Child concepts will be returned.
 * @returns A reference type filter for the child concepts of the designated branch in the selected Concept Scheme
 * @example
 * ```ts
 * import { branchFilter } from 'sanity-plugin-taxonomy-manager'
 * ...
 * {
 *   name: 'test',
 *   type: 'array',
 *   of: [
 *     {
 *       type: 'reference',
 *       to: {type: 'skosConcept'},
 *       options: {
 *         filter: branchFilter({schemeId: 'a1b2c3', branchId: 'd4e5f6'}),
 *         disableNew: true,
 *       },
 *     },
 *   ],
 * }
 * ```
 */
export declare const branchFilter: (
  options: BranchOptions,
) => ({getClient}: {getClient: Function}) => Promise<BranchFilterResult>

declare type BranchFilterResult = {
  filter: string
  params: BranchOptions & {
    concepts: string[]
  }
}

declare type BranchOptions = {
  schemeId: string
  branchId: string
}

declare interface Options {
  baseUri?: string
  customConceptFields?: FieldDefinition[]
  customSchemeFields?: FieldDefinition[]
}

/**
 * Hierarchy View Input Component for Reference Fields
 *
 * This component allows Studio users to browse and select taxonomy
 * terms from a hierarchical tree structure. It is designed to be
 * used as an input for taxonomy reference fields in Sanity Studio.
 *
 * Hierarchy view must be used in conjunction with the Taxonomy Manager
 * plugin `schemeFilter` or `branchFilter` options.
 */
export declare function ReferenceHierarchyInput(props: ObjectFieldProps<Reference>): JSX_2.Element

/**
 * #### Reference Field Scheme Filter
 * Pluggable Function for Filtering to a Single SKOS Concept Scheme
 * @param schemeId - The unique six character concept identifier for
 *   the Concept Scheme to which you wish to filter.
 * @returns A reference type filter for Concepts and Top Concepts in
 *   the selected Concept Scheme test
 * @example
 * ```ts
 * import { schemeFilter } from 'sanity-plugin-taxonomy-manager'
 * ...
 * {
 *   name: 'test',
 *   type: 'array',
 *   of: [
 *     {
 *       type: 'reference',
 *       to: {type: 'skosConcept'},
 *       options: {
 *         filter: schemeFilter({schemeId: 'a1b2c3'}),
 *         disableNew: true,
 *       },
 *     },
 *   ],
 * }
 * ```
 */
export declare const schemeFilter: (
  options: SchemeOptions,
) => ({getClient}: {getClient: Function}) => Promise<SchemeFilterResult>

declare type SchemeFilterResult = {
  filter: string
  params: {
    concepts: string[]
    topConcepts: string[]
  }
}

declare type SchemeOptions = {
  schemeId: string
}

/**
 * #### Defines a Sanity plugin for managing taxonomies
 * BaseURI should follow an IANA http/s scheme and should terminate with either a / or #.
 * @param options - Optional configuration options for the plugin.
 * @param options.baseUri - The base URI to use for SKOS concepts and concept schemes.
 * @param options.customConceptFields - An array of additional fields to add to the skosConcept type.
 * @param options.customSchemeFields - An array of additional fields to add to the skosConceptScheme type.
 * @returns A Sanity plugin object.
 */
export declare const taxonomyManager: Plugin_2<Options | undefined>

/**
 * #### Tree View Component Wrapper
 * This is the view component for the hierarchy tree. It is the
 * top level of concept scheme views and is passed into Desk
 * structure to render the primary view for taxonomy documents.
 * @param inputComponent - Specifies whether the component is Studio
 *    input component, which will hide tree view controls and chrome.
 */
export declare const TreeView: ({
  document,
  branchId,
  selectConcept,
  inputComponent,
}: {
  document: any
  branchId: string
  selectConcept: any
  inputComponent?: boolean
}) => JSX_2.Element

export {}
