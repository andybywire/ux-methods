import React from 'react'
import {Dialog, Flex, Button, Box, Text} from '@sanity/ui'
import type {ConfirmDeleteDialogProps} from '../types/BulkDeleteComponent.types'

/**
 * Confirmation dialog for deleting documents.
 * @param props - ConfirmDeleteDialogProps
 * @public
 */
export function ConfirmDeleteDialog({
  show,
  onCancel,
  onDelete,
  loading,
  count,
}: ConfirmDeleteDialogProps) {
  if (!show) return null
  return (
    <Dialog
      id="confirm-delete-dialog"
      header="Confirm Deletion"
      onClose={onCancel}
      width={1}
      zOffset={1000}
      footer={
        <Flex justify="flex-end" gap={2}>
          <Button text="Cancel" mode="bleed" onClick={onCancel} />
          <Button text="Delete" tone="critical" loading={loading} onClick={onDelete} />
        </Flex>
      }
    >
      <Box padding={4}>
        <Text>
          Are you sure you want to delete {count} document{count > 1 ? 's' : ''}? This action cannot be undone.
        </Text>
      </Box>
    </Dialog>
  )
}