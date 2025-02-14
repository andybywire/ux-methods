class Discipline {
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
            <h1>${discipline.title}</h1>
            <p>${discipline.metaDescription}</p>
            ${discipline.overview}
            <p><a href="/">back to index</a></p>
          </main>`
}

export default Discipline
