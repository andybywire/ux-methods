class DisciplineJs {
  data() {
    return {
      layout: 'base.njk',
      pagination: {
        data: 'disciplines',
        alias: 'discipline',
        size: 1,
      },
      permalink: function (data) {
        return `discipline/${this.slugify(data.discipline.slug)}/index.html`
      },
    }
  }
  
  render({discipline}) {
    return disciplineTemplate(discipline)
  }
}

// Helper function to generate the HTML template
// Creating is separately here to be able to reuse in Sanity Studio preview
export function disciplineTemplate(discipline) {
  return `<main>
            <h1>test ${discipline.title}</h1>
            <p>${discipline.metaDescription}</p>
            <p><a href="/">back to index</a></p>
          </main>`
}

export default DisciplineJs
