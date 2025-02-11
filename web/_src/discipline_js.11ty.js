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
        return `different/${this.slugify(data.discipline.slug)}/index.html`
      },
    }
  }

  render({discipline}) {
    return `<main>
              <h1>${discipline.title}</h1>
              <p>${discipline.metaDescription}</p>
              <p><a href="/">back to index</a></p>
            </main>`
  }
}

export default DisciplineJs
