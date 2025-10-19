import {set, ObjectInputProps, useFormValue} from 'sanity'
import {Button, Box, Text, Spinner, Card, Flex} from '@sanity/ui'

export default function GetLinkedData(props: ObjectInputProps) {
  const {path, onChange} = props

  // `path` resolves the absolute path for the object input component
  const isUpdating = useFormValue([...path, 'ldIsUpdating']) as boolean | undefined
  const lastUpdatedISO = useFormValue([...path, 'ldLastUpdated']) as string | undefined
  const fieldUrl = useFormValue([...path, 'resourceUrl']) as string | undefined
  const updateIssue = useFormValue([...path, 'ldUpdateIssue']) as string | undefined

  const lastUpdatedDate = lastUpdatedISO ? new Date(lastUpdatedISO) : undefined

  const handleChange = () => {
    const date = new Date().toISOString()
    onChange([set(date, ['ldLastRequested'])])
  }

  function isValidUrl(url: string) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <Box>
      {props.renderDefault(props)}
      <Card paddingTop={[3]}>
        <Button
          fontSize={[2]}
          padding={[3]}
          text="Get linked data"
          mode="ghost"
          disabled={!fieldUrl || !isValidUrl(fieldUrl)}
          tone="default"
          width="fill"
          onClick={handleChange}
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