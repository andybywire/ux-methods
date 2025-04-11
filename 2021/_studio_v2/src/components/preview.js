import React from "react"

// JS Client Library address: 'http://localhost:8000/preview/method/index.html?page='
const url = 'http://localhost:8000/method/'

// Don't forget to assign this in an environment variable when the studio
// is published.

const StudioPreview = ({document}) => {
  const {displayed} = document
  return (
    <iframe
      src={url + displayed.slug.current}
      frameBorder={0}
      style={{width:'100%',height:'100%'}}
    />
  )
}

export default StudioPreview
