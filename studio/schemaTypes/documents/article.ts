import {defineType, defineField} from 'sanity'
import {RiArticleLine} from 'react-icons/ri'
import {ArrayHierarchyInput, ReferenceHierarchyInput} from 'sanity-plugin-taxonomy-manager'
import {branchFilter, schemeFilter} from 'sanity-plugin-taxonomy-manager'

/**
 * Article Type
 * On UX Methods, articles are a generic type that capture information
 * about the UX Methods site, its purpose, and its intended use.
 */
export default defineType({
  name: 'article',
  type: 'document',
  icon: RiArticleLine,
  title: 'Articles',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
    }),
    defineField({
      name: 'singleTermFromSchemeNoTop',
      type: 'reference',
      to: [{type: 'skosConcept'}],
      options: {
        filter: schemeFilter({schemeId: 'ae5dea'}),
        disableNew: true,
      },
      components: {field: ReferenceHierarchyInput},
    }),
    defineField({
      name: 'singleTermFromScheme',
      type: 'reference',
      to: [{type: 'skosConcept'}],
      options: {
        filter: schemeFilter({schemeId: '1293cc'}),
        disableNew: true,
      },
      components: {field: ReferenceHierarchyInput},
    }),
    defineField({
      name: 'singleTermFromBranchNoTop',
      type: 'reference',
      to: [{type: 'skosConcept'}],
      options: {
        filter: branchFilter({schemeId: 'ae5dea', branchId: '3d4b17'}),
        disableNew: true,
      },
      components: {field: ReferenceHierarchyInput},
    }),
    defineField({
      name: 'singleTermFromBranch',
      type: 'reference',
      to: [{type: 'skosConcept'}],
      options: {
        filter: branchFilter({schemeId: '1293cc', branchId: 'fb5d42'}),
        disableNew: true,
      },
      components: {field: ReferenceHierarchyInput},
    }),
    defineField({
      name: 'arrayFromScheme',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: {type: 'skosConcept'},
          options: {
            filter: schemeFilter({schemeId: '1293cc'}),
            disableNew: true,
          },
        },
      ],
      components: {field: ArrayHierarchyInput},
    }),
    defineField({
      name: 'arrayFromBranch',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: {type: 'skosConcept'},
          options: {
            filter: branchFilter({schemeId: '1293cc', branchId: 'fb5d42'}),
            disableNew: true,
          },
        },
      ],
      components: {field: ArrayHierarchyInput},
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      title: 'Short Description',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroImage',
      type: 'heroImage',
      title: 'Hero Image',
    }),
    defineField({
      name: 'body',
      type: 'bodyPortableText',
      title: 'Article Body',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      icon: 'icon',
      thumb: 'heroImage',
    },
    prepare(selection) {
      const {title, icon, thumb} = selection
      return {
        title: title,
        media: thumb ? thumb : icon,
      }
    },
  },
})
