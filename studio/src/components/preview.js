import React from "react"

const url = 'http://localhost:8000/preview/method/index.html?page='
// Don't forget to assign this in an environment variable when the stufio
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
