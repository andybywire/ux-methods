import React from 'react';
import type { ConfirmDeleteDialogProps } from '../types/BulkDeleteComponent.types';
/**
 * Confirmation dialog for deleting documents.
 * @param props - ConfirmDeleteDialogProps
 * @public
 */
export declare function ConfirmDeleteDialog({ show, onCancel, onDelete, loading, count, }: ConfirmDeleteDialogProps): React.JSX.Element | null;
