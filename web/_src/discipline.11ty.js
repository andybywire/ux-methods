export const data = {
  layout: 'base.njk',
  pagination: {
    alias: 'discipline',
    data: 'disciplines',
    size: 1,
  },
  permalink: function (data) {
    return `discipline/${this.slugify(data.discipline.slug)}/index.html`
  },
}

export function render(data) {
  return `<main>
            <h1>${data.discipline.title}</h1>
            <p>${data.discipline.metaDescription}</p>
            <p><a href="/">back to index</a></p>
          </main>`
}
