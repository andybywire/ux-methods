import React from 'react'

const Default = (props) => {
  return <p>{JSON.stringify(props.location, null, 2)}</p>
}

export default Default
