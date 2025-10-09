import React from 'react'
import {Flex, Text, Box, Select, Button} from '@sanity/ui'
import type {DocumentTypeSelectProps} from '../types/BulkDeleteComponent.types'

/**
 * Dropdown for selecting a document type.
 * @param props - DocumentTypeSelectProps
 * @public
 */
export function DocumentTypeSelect({
  docTypes,
  selectedType,
  setSelectedType,
  forceRender,
}: DocumentTypeSelectProps) {
  return (
    <Flex align="center" gap={2}>
      <Text>Document Type:</Text>
      <Box flex={1}>
        <Select
          value={selectedType}
          onChange={e => setSelectedType(e.currentTarget.value)}
          style={{minWidth: 180}}
          fontSize={2}
        >
          <option value="">Select type</option>
          {docTypes.map(type => (
            <option key={type.name} value={type.name}>
              {type.title}
            </option>
          ))}
        </Select>
      </Box>
      <Button
        mode="ghost"
        tone="primary"
        padding={2}
        style={{minWidth: 0}}
        onClick={forceRender}
        disabled={!selectedType}
        title="Force re-render"
      >
        &#x21bb;
      </Button>
    </Flex>
  )
}