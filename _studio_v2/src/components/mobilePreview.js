import React from "react"

// JS Client Library address: 'http://localhost:8000/preview/method/index.html?page='
const url = 'http://localhost:8000/method/'

// Don't forget to assign this in an environment variable when the studio
// is published.

// 375 x 667 — iPhone 6/7/8

const MobilePreview = ({document}) => {
  const {displayed} = document
  return (
    <iframe
      src={url + displayed.slug.current}
      frameBorder={0}
      style={{width:'375px',height:'667px',border:'1px solid #dee2e9'}}
    />
  )
}

export default MobilePreview
