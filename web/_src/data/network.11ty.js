class NetworkTemplate {
  data() {
    return {
      permalink: "/r/data/network.json",
      eleventyExcludeFromCollections: true,
      layout: false
    }
  }

  render(data) {
    return JSON.stringify({
      nodes: [
        ...data.disciplines.map(d => ({
          type: 'discipline',
          title: d.title,
          slug: d.slug,
          uri: d.uri
        })),
        ...data.methods.map(m => ({
          type: 'method',
          title: m.title,
          slug: m.slug,
          uri: m.uri
        }))
      ],
      links: data.disciplines.flatMap(discipline => 
        (discipline.methods || []).map(method => ({
          source: discipline.slug,
          target: method.slug
        }))
      )
    }, null, 2)
  }
}

export default NetworkTemplate
