import type {SchemaTypeDefinition} from 'sanity'

/**
 * Configuration options for the Bulk Delete tool plugin.
 * @public
 */
export interface BulkDeleteToolOptions {
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

/**
 * Props for the {@link PermissionNotice} component.
 * Used to display a message when the user does not have permission to use the tool.
 * @public
 */
export interface PermissionNoticeProps {
  /**
   * List of roles that are allowed to use the Bulk Delete tool.
   */
  roles: string[]
}

/**
 * Props for the {@link DocumentTypeSelect} component.
 * Used for rendering the dropdown to select a document type for deletion.
 * @public
 */
export interface DocumentTypeSelectProps {
  /**
   * Array of available document types for selection.
   * Each type should have a unique `name` and a human-readable `title`.
   */
  docTypes: {name: string; title: string}[]
  /**
   * The currently selected document type name.
   */
  selectedType: string
  /**
   * Callback to update the selected document type.
   * @param type - The name of the selected document type.
   */
  setSelectedType: (type: string) => void
  /**
   * Callback to force a re-render of the component.
   * Useful for refreshing the list of documents.
   */
  forceRender: () => void
}

/**
 * Props for the {@link DocumentList} component.
 * Used for rendering the list of documents with selection checkboxes.
 * @public
 */
export interface DocumentListProps {
  /**
   * Array of documents available for selection and deletion.
   */
  documentsData: any[]
  /**
   * Array of documents that have strong references and cannot be deleted.
   */
  stronglyReferencedDocs: any[]
  /**
   * Function to check if a document is currently selected.
   * @param doc - The document object to check.
   * @returns `true` if the document is selected, otherwise `false`.
   */
  isDocSelected: (doc: any) => boolean
  /**
   * Callback to select or deselect a document by its ID.
   * @param id - The document's unique ID.
   */
  handleSelectDoc: (id: string) => void
}

/**
 * Props for the {@link ConfirmDeleteDialog} component.
 * Used for rendering the confirmation dialog before deleting documents.
 * @public
 */
export interface ConfirmDeleteDialogProps {
  /**
   * Whether the confirmation dialog should be visible.
   */
  show: boolean
  /**
   * Callback to close or cancel the dialog.
   */
  onCancel: () => void
  /**
   * Callback to confirm and execute the deletion.
   */
  onDelete: () => void
  /**
   * Whether the deletion operation is currently loading.
   */
  loading: boolean
  /**
   * Number of documents selected for deletion.
   */
  count: number
}