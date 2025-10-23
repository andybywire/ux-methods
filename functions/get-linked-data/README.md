
# Get Linked Data Function

## Problem

Manually gathering metadata (title, description, author, publisher, image) from external links is tedious and inconsistent. Content teams often need this linked data for creating resource libraries, curated content lists, or reference archives—but scraping and entering it manually takes time and leads to errors.

## Solution

The Get Linked Data Function automatically retrieves and stores metadata for URLs using the [Metascraper](https://metascraper.js.org/#/) library. When a document’s URL is updated or requested, this function:
- Fetches the HTML of the linked page
- Extracts metadata (title, author, description, publisher, image)
- Uploads and references the page’s image in your Sanity dataset
- Updates bookkeeping fields to track recency and ensure invocation hygiene

This enables consistent, high-quality metadata capture with minimal manual work.

## Benefits

- Saves time by automating link metadata extraction
- Improves data consistency across resources
- Adds visual context by auto-uploading referenced images
- Integrates cleanly into Sanity’s event-driven Functions system
- Reusable across multiple document types &mdash; anywhere you have a url and a metadata object

## Schema Setup

This function works with any of the official Sanity “clean” templates. You can also add it to existing content models that include a URL field. Optionally, you can adjust the paths (`resourceUrl`, `ldMetadata`, etc.) in your blueprint, function, and input component to match your preferred naming conventions.

### Schema Setup

1. The document schema you use must include a URL field and a metadata object, for example:

    ``` ts
    import GetLinkedData from './linkedDataInput'

    defineField({
      name: 'resourceUrl',
      title: 'Resource URL',
      type: 'url',
      components: {
        input: GetLinkedData,
      },
    }),
    defineField({
      name: 'ldMetadata',
      title: 'Linked Data Metadata',
      type: 'object',
      fields: [
        { name: 'ldIsUpdating', type: 'boolean' },
        { name: 'ldLastUpdated', type: 'datetime' },
        { name: 'ldLastRequested', type: 'datetime' },
        { name: 'ldUpdateIssue', type: 'string' },
      ],
    }),
    ```

2. The `GetLinkedData` input component is not strictly necessary for fetching linked data on document creation, but it provides functionality for refetching data and displaying fetch issues to Studio users:

    ```ts
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
    ```

3. Be sure to deploy your updated schema:

    ```bash
    # /studio
    npx sanity schema deploy
    ```

## Implementation

**Important:** Run these commands from the root of your project (not inside the `studio/` folder).

1. **Initialize blueprints**

   Run this if you haven't initialized blueprints:

   ```bash
   npx sanity blueprints init
   ```

   You'll be prompted to select your organization and Sanity studio.

2. **Add the function**
   
   Add the function as an `index.ts` file in a new folder in your functions directory called `get-lnked-data/`. Your `functions/` directory is located at the project root, not in your `studio/` directory: 

    ```
    /
    ├─ functions/
    │   └─ get-linked-data/
    │      └─ index.ts
    └─ studio/
    ```

3. **Add the configuration to your blueprint**

    ```ts
    defineDocumentFunction({
      type: "sanity.function.document",
      name: "get-linked-data",
      src: "./functions/get-linked-data",
      memory: 2,
      timeout: 30,
      event: {
        on: ["update", "create"],
        includeDrafts: true,
        includeAllVersions: true,
        filter:
          `_type == 'resource' 
          && (
            delta::changedAny(ldMetadata.ldLastRequested) 
            || (
              !defined(before().ldMetadata.ldLastRequested) 
              && defined(after().ldMetadata.ldLastRequested)
            )
            || (
              delta::operation() == 'create'
              && defined(resourceUrl)
            )
          )
          && ldMetadata.ldIsUpdating != true
          `,
        projection:
          "{_id, title, 'url':resourceUrl}",
      },
    }),
    ```

    Your blueprint should also be located at the project root directory:

    ```text
    /
    ├─ functions/
    │   └─ get-linked-data/
    │      └─ index.ts
    ├─ studio/
    └─ sanity.blueprint.ts
    ```

4. **Install dependencies**

      In addition to `@sanity/client` and `@sanity/functions`, this function uses the [Metascraper](https://metascraper.js.org/#/) library to retrieve linked data: 

    ```json
    {
      "dependencies": {
        "@sanity/client": "^7.11.2",
        "@sanity/functions": "^1.0.3",
        "metascraper": "^5.49.4",
        "metascraper-author": "^5.49.2",
        "metascraper-date": "^5.49.2",
        "metascraper-description": "^5.49.2",
        "metascraper-image": "^5.49.2",
        "metascraper-publisher": "^5.49.2",
        "metascraper-title": "^5.49.2"
      }
    }
    ```

    You can add these dependencies at the project root or at the function level. Refer to the [Sanity Functions dependencies documentation](https://www.sanity.io/docs/compute-and-ai/function-dependencies#cd8c4d577f9f) for more details. Install dependencies with:

    ```bash
    npm install
    ```

## Testing the function locally

You can test the get-linked-data function locally using the Sanity CLI before deploying it to production.

### Simple Testing Command

Test the function with an existing document ID from your dataset:

```bash
npx sanity functions test get-linked-data --document-id <your-document-id> --dataset production --with-user-token
```

- Replace <insert-document-id> with an actual document ID from your dataset and production with your dataset name.
-	Use --with-user-token to test writes locally.
-	Test against valid and invalid URLs to verify error handling.

### Interactive Development Mode

For interactive local testing, run:

```bash
npx sanity functions dev
```

### Testing Tips
- Use real document IDs &mdash; Document functions require IDs that exist in your dataset
- Use Node.js v22.x locally to match production runtime
- Test edge cases like malformed URLs or URLs that return a 404
- Check function logs in CLI output for debugging

## Requirements
- A Sanity project with Functions enabled
- A schema with:
	-	A `url` field
	-	An `ldMetadata` object with `status` and `timestamp` fields
	-	Linked data fields (`title`, `author`, `publisher`, `metaDescription`, etc.)
- This function _does not_ use Sanity's AI capabilities
- Node.js v22.x for local development

## Usage Example

When a content editor pastes or updates a URL in a resource document:
1. The linked data input component sets `ldMetadata.ldLastRequested` to the current time.
2. The function detects this change and triggers automatically.
3. The function:
  -	Fetches and parses the linked page
  -	Uploads the page’s main image (if available)
  -	Writes `title`, `author`, `publisher`, and `description` fields
  -	Updates bookkeeping fields (`ldLastUpdated`, `ldIsUpdating`, `ldUpdateIssue`)
4. The resource document updates with rich metadata and an image&mdash;all automatically.

**Result:** Consistent, complete metadata for external resources with one click (or less).

## Customization

You can adapt this function to other use cases:
-	Add new metascraper rules to capture logos, keywords, or other OpenGraph data.
-	Modify target paths (e.g., write to `seo.title` or `metadata.publisher`).
-	Change triggers in the blueprint (on: ['create', 'update'], filters, etc.).
-	Integrate with other functions (e.g., [taxonomy-term-auto-tag](https://www.sanity.io/recipes/taxonomy-term-auto-tag-db35888b) based on short descriptions).

