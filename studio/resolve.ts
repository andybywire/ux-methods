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
  },
}

// export const resolve: PresentationPluginOptions["resolve"] = {
//   locations: {
//     // Add more locations for other post types
//     method: defineLocations({
//       select: {
//         title: "title",
//         slug: "slug.current",
//       },
//       resolve: (doc) => ({
//         locations: [
//           {
//             title: doc?.title || "Untitled",
//             href: `/method/${doc?.slug}`,
//           },
//         ],
//       }),
//     }),
//   },
// };
