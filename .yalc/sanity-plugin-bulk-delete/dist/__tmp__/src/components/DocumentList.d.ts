import React from 'react';
import type { DocumentListProps } from '../types/BulkDeleteComponent.types';
/**
 * List of documents with checkboxes for selection.
 * @param props - DocumentListProps
 * @public
 */
export declare function DocumentList({ documentsData, stronglyReferencedDocs, isDocSelected, handleSelectDoc, }: DocumentListProps): React.JSX.Element;
