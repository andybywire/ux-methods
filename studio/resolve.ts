import {
  DocumentLocationResolver,
  DocumentLocationsState,
  PresentationPluginOptions,
} from 'sanity/presentation'
import {map, Observable} from 'rxjs'

const locations: DocumentLocationResolver = (params, context) => {
  if (params.type === 'method' || params.type === 'discipline') {
    const doc$ = context.documentStore.listenQuery(
      `*[_id==$id 
          || (_type == 'discipline' 
              && _id!=$id
              && _id in *[_id==$id][0].disciplinesReference[]._ref)
          ]{_type, slug, title}`,
      {id: params.id},
      {perspective: 'drafts'},
    ) as Observable<
      | {
          _type: string
          slug?: {current: string}
          title?: string | null
        }[]
      | null
    >

    return doc$.pipe(
      map((docs): DocumentLocationsState | null => {
        if (!docs) {
          return {
            message: 'Unable to map document type to locations',
            tone: 'critical',
          } satisfies DocumentLocationsState
        }

        const disciplineLocations = docs
          .filter(({_type, slug}) => _type === 'discipline' && slug?.current)
          .map(({title, slug}) => ({
            title: title || 'Untitled article',
            href: `/discipline/${slug!.current}`,
          }))

        const methodLocations =
          docs
            .filter(({_type, slug}) => _type === 'method' && slug?.current)
            .map(({title, slug}) => ({
              title: title || 'Untitled method',
              href: `/method/${slug!.current}`,
            })) || []

        return {
          locations: [
            ...disciplineLocations,
            ...methodLocations,
            ...(methodLocations.length > 0 ? [{title: 'All Methods', href: '/all-methods'}] : []),
            ...(disciplineLocations.length > 0 && methodLocations?.length < 1
              ? [
                  {
                    title: 'Disciplines',
                    href: '/disciplines',
                  },
                ]
              : []),
          ],
        }
      }),
    )
  }
  return null
}

export const resolve: PresentationPluginOptions['resolve'] = {
  locations,
}
