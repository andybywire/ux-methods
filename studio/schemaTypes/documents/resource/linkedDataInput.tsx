import {UrlInputProps, useFormValue, useClient} from 'sanity'
import {Button, Box, Text, Spinner, Card, Flex, useToast} from '@sanity/ui'

type Props = UrlInputProps & {
  metaPath?: string[] // the path of the `ldMetadata` object
}

export default function GetLinkedData(props: Props) {
  const {renderDefault, value, metaPath = ['ldMetadata']} = props

  const client = useClient({apiVersion: 'v2025-10-20'})
  const toast = useToast()
  const docId = useFormValue(['_id']) as string | undefined
  const isUpdating = useFormValue([...metaPath, 'ldIsUpdating']) as boolean | undefined
  const lastUpdatedISO = useFormValue([...metaPath, 'ldLastUpdated']) as string | undefined
  const updateIssue = useFormValue([...metaPath, 'ldUpdateIssue']) as string | undefined

  const lastUpdatedDate = lastUpdatedISO ? new Date(lastUpdatedISO) : undefined

  const handleClick = async () => {
    if (!docId) return
    toast.push({
      status: 'success',
      title: 'Linked Data fetch initiated.'
    })
    const now = new Date().toISOString()
    await client
      .patch(docId)
      .setIfMissing({[metaPath[0]]: {}})
      .set({
        [`${metaPath.join('.')}.ldLastRequested`]: now,
      })
      .commit({returnDocuments: false})
  }

  return (
    <Box>
      {renderDefault(props)}
      <Card paddingTop={[3]}>
        <Button
          fontSize={[2]}
          padding={[3]}
          text="Get linked data"
          mode="ghost"
          disabled={!value || !isValidUrl(value)}
          tone="default"
          width="fill"
          onClick={handleClick}
        />
      </Card>
      <Card paddingTop={3}>
        <Flex direction="row" gap={2}>
          {isUpdating ? (
            <>
              <Spinner size={1} />
              <Text size={1} weight="medium" muted>
                Fetching linked data
              </Text>
            </>
          ) : updateIssue ? (
            <Text size={1} weight="medium" muted>
              {updateIssue}
            </Text>
          ) : (
            lastUpdatedDate && (
              <Text size={1} weight="medium" muted>
                Last updated {lastUpdatedDate.toLocaleDateString('en-US')}
              </Text>
            )
          )}
        </Flex>
      </Card>
    </Box>
  )
}

function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
