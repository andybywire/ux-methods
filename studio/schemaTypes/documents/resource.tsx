import {defineType, defineField, set, ObjectInputProps, useFormValue} from 'sanity'
import {Button, Box, Text, Spinner, Card, Flex} from '@sanity/ui'
import {RiLinksLine, RiArticleLine} from 'react-icons/ri'
// import GetLinkedData from '...'

/**
 * Resource Type
 * Resources are links to external sources of information on a given
 * Method or Discipline.
 *
 * TODO: Account for Linked Data input component (and web service)
 */

const debug = true // For component development; remove once

// Move this to a separate exported component
function GetLinkedData(props: ObjectInputProps) {
  const {path, onChange} = props

  // `path` resolves the absolute path for the object input component
  const isUpdating = useFormValue([...path, 'ldIsUpdating']) as boolean | undefined
  const lastUpdatedISO = useFormValue([...path, 'ldLastUpdated']) as string | undefined
  const fieldUrl = useFormValue([...path, 'resourceUrl']) as string | undefined

  const lastUpdatedDate = lastUpdatedISO ? new Date(lastUpdatedISO) : undefined

  const handleChange = () => {
    const date = new Date().toISOString()
    onChange([set(date, ['ldLastRequested'])])
  }

  // Move to a utility function
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

export default defineType({
  name: 'resource',
  type: 'document',
  icon: RiLinksLine,
  title: 'Resources',
  fields: [
    defineField({
      name: 'resourceUrl',
      type: 'url',
      title: 'Resource URL',
    }),
    defineField({
      // hoist this
      name: 'resourceUrlLd',
      title: 'Resource URL and linked data status',
      type: 'object',
      components: {
        input: GetLinkedData,
      },
      fields: [
        defineField({
          name: 'resourceUrl',
          title: 'Resource URL',
          type: 'url',
        }),
        defineField({
          name: 'ldLastUpdated',
          description: 'The time of the most recent update to the linked data of this resource',
          type: 'datetime',
          hidden: debug ? false : true,
        }),
        defineField({
          name: 'ldLastRequested',
          description:
            'The time of the most recent request to update the linked data of this resource',
          type: 'datetime',
          hidden: debug ? false : true,
        }),
        defineField({
          name: 'ldIsUpdating',
          description:
            'A Boolean that indicates that a LD update request has been sent to the LD function and is not yet resolved',
          type: 'boolean',
          hidden: debug ? false : true,
        }),
      ],
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
    }),
    defineField({
      name: 'author',
      type: 'string',
      title: 'Author',
    }),
    defineField({
      name: 'publisher',
      type: 'publisher',
    }),
    defineField({
      name: 'pubDate',
      type: 'date',
      title: 'Date First Published',
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      title: 'Description',
      rows: 3,
    }),
    defineField({
      name: 'resourceImage',
      type: 'image',
      title: 'Image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'methodDescribed',
      type: 'array',
      title: 'Method(s) Described',
      description: 'What UX Methods does this resource provide information about?',
      of: [{type: 'describedMethod'}],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      publisher: 'publisher.pubName',
      author: 'author',
      media: 'resourceImage',
    },
    prepare(selection) {
      const {title, publisher, author, media} = selection
      return {
        title: title,
        subtitle: author ? `${publisher} • ${author}` : publisher,
        media: media ?? RiArticleLine,
      }
    },
  },
})
