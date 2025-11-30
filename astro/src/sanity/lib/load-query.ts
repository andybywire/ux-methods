import {type QueryParams} from 'sanity'
import {sanityClient} from 'sanity:client'

const visualEditingEnabled = import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === 'true'

// Read SANITY_API_READ_TOKEN from either 
// import.meta.env (Astro) or process.env (Node)
const rawToken =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.SANITY_API_READ_TOKEN) ||
  process.env.SANITY_API_READ_TOKEN ||
  "";

  // Normalize to string or undefined
const token = rawToken && `${rawToken}`;

export async function loadQuery<QueryResponse>({
  query,
  params,
}: {
  query: string
  params?: QueryParams
}) {
  if (visualEditingEnabled && !token) {
    throw new Error(
      'The `SANITY_API_READ_TOKEN` environment variable is required during Visual Editing.'
    )
  }

  const perspective = visualEditingEnabled ? 'drafts' : 'published'

  const {result, resultSourceMap} = await sanityClient.fetch<QueryResponse>(query, params ?? {}, {
    filterResponse: false,
    perspective,
    resultSourceMap: visualEditingEnabled ? 'withKeyArraySelector' : false,
    stega: visualEditingEnabled,
    ...(visualEditingEnabled ? {token} : {}),
  })

  return {
    data: result,
    sourceMap: resultSourceMap,
    perspective,
  }
}
