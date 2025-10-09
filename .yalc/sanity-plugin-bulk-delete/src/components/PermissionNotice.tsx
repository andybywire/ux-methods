import React from 'react'
import {Card, Stack, Text} from '@sanity/ui'
import type {PermissionNoticeProps} from '../types/BulkDeleteComponent.types'

/**
 * Displays a message if the user does not have permission to use the tool.
 * @param props - PermissionNoticeProps
 * @public
 */
export function PermissionNotice({roles}: PermissionNoticeProps) {
  return (
    <Card padding={4} radius={3} shadow={1} style={{maxWidth: 500, margin: '2rem auto'}}>
      <Stack space={4}>
        <Text size={2} weight="semibold">
          Tool can only be used by the following roles:{' '}
          {roles
            .map(role =>
              role
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ')
            )
            .join(', ')}
        </Text>
      </Stack>
    </Card>
  )
}