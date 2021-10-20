import React from "react"

// JS Client Library address: 'http://localhost:8000/preview/method/index.html?page='
const url = 'http://localhost:8000/methods/'

// Don't forget to assign this in an environment variable when the studio
// is published.

const MobilePreview = ({document}) => {
  const {displayed} = document
  return (
    <iframe
      src={url + displayed.slug.current}
      frameBorder={0}
      style={{width:'375px',height:'667px'}}
    />
  )
}

export default MobilePreview
