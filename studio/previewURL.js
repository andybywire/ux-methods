// JS Client Library address: `http://localhost:8000/preview/${document._type}/index.html?page=${document.slug.current}`

export default function resolvePreviewUrl(document) {
  return `http://localhost:8000/${document._type}/${document.slug.current}`
}
