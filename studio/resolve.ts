import {defineLocations} from 'sanity/presentation'
import type {PresentationPluginOptions} from 'sanity/presentation'
export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    method: defineLocations({
      select: {
        title: 'title',
        slug: 'slug.current',
      },
      resolve: (doc) => ({
        locations: doc?.slug
          ? [
              {
                title: doc?.title || 'Untitled method',
                href: `/method/${doc.slug}`,
              },
            ]
          : [],
      }),
    }),
    discipline: defineLocations({
      select: {
        title: 'title',
        slug: 'slug.current',
      },
      resolve: (doc) => ({
        locations: doc?.slug
          ? [
              {
                title: doc?.title || 'Untitled discipline',
                href: `/discipline/${doc.slug}`,
              },
            ]
          : [],
      }),
    }),
    documentation: defineLocations({
      select: {
        title: 'title',
        slug: 'slug.current',
      },
      resolve: (doc) => ({
        locations: doc?.slug
          ? [
              {
                title: doc?.title || 'Untitled document',
                href: `/${doc.slug}`,
              },
            ]
          : [],
      }),
    }),
  },
}
