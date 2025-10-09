import React, { useEffect, useState, useCallback } from 'react'
import { useCurrentUser, useClient, usePerspective, isString } from 'sanity'
import { Button, Card, Flex, Spinner, Stack, Text, useToast } from '@sanity/ui'
import { defineQuery } from 'groq'
import type { BulkDeleteToolOptions } from '../types/BulkDeleteComponent.types'
import { PermissionNotice } from './PermissionNotice'
import { DocumentTypeSelect } from './DocumentTypeSelect'
import { DocumentList } from './DocumentList'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'

/**
 * BulkDeleteComponent provides a UI for bulk deleting documents in Sanity Studio.
 * @param config - BulkDeleteToolOptions
 * @returns React.ReactElement
 * @public
 */
export const BulkDeleteComponent = (config: BulkDeleteToolOptions) => {
  const { schemaTypes } = config || {}
  const [docTypes, setDocTypes] = useState<{ name: string; title: string }[]>([])
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedDocs, setSelectedDocs] = useState<Set<{ _id: string; _type: string }>>(new Set())
  const [loading, setLoading] = useState(false)
  const [documentsData, setDocumentsData] = useState<any[]>([])
  const [typesData, setTypesData] = useState<any[]>([])
  const [_, forceRender] = useState(0)
  const [stronglyReferencedDocs, setStronglyReferencedDocs] = useState<any[]>([])
  const [showConfirm, setShowConfirm] = useState(false)
  const currentUser = useCurrentUser()
  const perspective = usePerspective()
  const perspectiveName = perspective.selectedPerspectiveName || perspective.selectedPerspective
  const sanityClient = useClient({ apiVersion: '2025-05-29' })
  const toast = useToast()

  // Compute GROQ filter for the current perspective
  const perspectiveMatch =
    perspectiveName === 'published'
      ? `!(_id in path("drafts.**") || _id in path("versions.**")) &&`
      : perspectiveName === 'drafts'
        ? `(_id in path("drafts.**")) &&`
        : isString(perspectiveName)
          ? `(_id in path("versions.${perspectiveName}.**")) &&`
          : ''

  // Permission check
  const isAdmin = currentUser?.roles?.some(
    (role: any) => role.name === 'administrator' || config.roles?.includes(role.name)
  )
  if (!isAdmin) {
    const roles = config.roles ? Array.from(new Set([...config.roles, 'administrator'])) : ['administrator']
    return <PermissionNotice roles={roles} />
  }

  // Helper to fetch documents by reference count
  const fetchDocuments = async ({
    type,
    hasStrongRefs,
  }: {
    type: string
    hasStrongRefs: boolean
  }) => {
    const refCountCondition = hasStrongRefs
      ? 'count(*[references(^._id) && (!defined(_weak) || _weak != true)]) > 0'
      : 'count(*[references(^._id) && (!defined(_weak) || _weak != true)]) == 0'
    const extraFields = hasStrongRefs
      ? ''
      : ', "hasWeakReferences": count(*[references(^._id) && defined(_weak) && _weak == true]) > 0'
    const query = defineQuery(
      `*[ ${perspectiveMatch} _type == "${type}" && ${refCountCondition}]{_id, _type, title, prefLabel, name${extraFields}}`
    )
    return sanityClient.fetch(query, {}, { perspective: 'raw' })
  }

  // Fetch all unique document types from the dataset
  useEffect(() => {
    const fetchTypes = async () => {
      const query = defineQuery(`array::unique(*[]._type)`)
      const data = await sanityClient.fetch(query, {}, { perspective: 'raw' })
      setTypesData(data)
    }
    fetchTypes()
  }, [sanityClient])

  // Fetch documents of the selected type
  useEffect(() => {
    if (!selectedType) {
      setDocumentsData([])
      setStronglyReferencedDocs([])
      return
    }
    setLoading(true)
    Promise.all([
      fetchDocuments({ type: selectedType, hasStrongRefs: false }),
      fetchDocuments({ type: selectedType, hasStrongRefs: true }),
    ])
      .then(([docs, strongRefs]) => {
        setDocumentsData(docs)
        setStronglyReferencedDocs(strongRefs)
      })
      .finally(() => setLoading(false))
  }, [selectedType, sanityClient, perspectiveMatch, _])

  // Compute the list of document types available for deletion
  useEffect(() => {
    const types =
      schemaTypes
        ?.filter((type: any) => type.type === 'document' && !type.hidden)
        .map((type: any) => ({
          name: type.name,
          title: type.title || type.name,
        }))
        .sort((a, b) => a.title.localeCompare(b.title)) || []
    const typesFromQuery = (typesData as string[]).map(name => ({
      name,
      title: `Not Found in Schema - ${name}`,
    }))
    const mergedTypes = [
      ...types,
      ...typesFromQuery.filter(tq => !types.some(t => t.name === tq.name)),
    ].filter(type => !type.name.includes('.'))
    setDocTypes(mergedTypes)
  }, [typesData, schemaTypes])

  // Checks if a document is currently selected
  const isDocSelected = useCallback(
    (doc: any) => Array.from(selectedDocs).some(h => h._id === doc._id && h._type === doc._type),
    [selectedDocs]
  )

  // Handles selecting or deselecting a single document
  const handleSelectDoc = useCallback(
    (id: string) => {
      setSelectedDocs(prev => {
        const doc = documentsData.find(d => d._id === id)
        if (!doc) return prev
        const exists = Array.from(prev).some(h => h._id === doc._id && h._type === doc._type)
        const newSet = new Set(prev)
        if (exists) {
          Array.from(newSet).forEach(h => {
            if (h._id === doc._id && h._type === doc._type) newSet.delete(h)
          })
        } else {
          newSet.add({ _id: doc._id, _type: doc._type })
        }
        return newSet
      })
    },
    [documentsData]
  )

  // Handles selecting or deselecting all documents in the current list
  const handleSelectAll = useCallback(() => {
    if (selectedDocs.size === documentsData.length) {
      setSelectedDocs(new Set())
    } else {
      setSelectedDocs(new Set(documentsData.map(doc => ({ _id: doc._id, _type: doc._type }))))
    }
  }, [selectedDocs, documentsData])

  // Handles deleting all selected documents
  const handleDelete = useCallback(async () => {
    setShowConfirm(false)
    if (selectedDocs.size === 0) return
    setLoading(true)
    try {
      const tx = sanityClient.transaction()
      Array.from(selectedDocs).forEach(doc => {
        tx.delete(doc._id)
      })
      await tx.commit()
      toast.push({
                status: 'success',
                title: `${selectedDocs.size} Documents Deleted`
            })
      setSelectedDocs(new Set())
      // Refresh documents after deletion
      const docs = await fetchDocuments({ type: selectedType, hasStrongRefs: false })
      setDocumentsData(docs)
    } catch (e) {
      toast.push({
        status: 'error',
        title: 'Error Deleting Documents',
        description: e instanceof Error ? e.message : String(e)
      })
      console.error('Error deleting documents:', e)
    } finally {
      setLoading(false)
    }
  }, [selectedDocs, sanityClient, selectedType, documentsData, perspectiveMatch])

  return (
    <Card padding={4} radius={3} shadow={1} style={{ maxWidth: 500, margin: '2rem auto' }}>
      <Stack space={4}>
        <Text size={2} weight="semibold">
          Bulk Delete Documents
        </Text>
        <DocumentTypeSelect
          docTypes={docTypes}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          forceRender={() => forceRender(n => n + 1)}
        />
        {loading && (
          <Flex align="center" gap={2}>
            <Spinner muted />
            <Text>Loading...</Text>
          </Flex>
        )}
        {selectedType && !loading && (
          <>
            <Button
              mode="bleed"
              tone="primary"
              onClick={handleSelectAll}
              disabled={documentsData.length === 0}
              text={
                documentsData.length === 0
                  ? 'No Documents Found'
                  : selectedDocs.size === documentsData.length
                    ? 'Deselect All'
                    : 'Select All'
              }
            />
            <DocumentList
              documentsData={documentsData}
              stronglyReferencedDocs={stronglyReferencedDocs}
              isDocSelected={isDocSelected}
              handleSelectDoc={handleSelectDoc}
            />
            <Button
              tone="critical"
              disabled={selectedDocs.size === 0 || loading}
              onClick={() => setShowConfirm(true)}
              text={`Delete Selected (${selectedDocs.size})`}
            />
            <ConfirmDeleteDialog
              show={showConfirm}
              onCancel={() => setShowConfirm(false)}
              onDelete={handleDelete}
              loading={loading}
              count={selectedDocs.size}
            />
          </>
        )}
      </Stack>
    </Card>
  )
}