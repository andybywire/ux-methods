import React from "react"
import * as s from "./grid.module.scss"

const Grid = ({ children }) => {
  return(
    <ul className={s.grid}>
      {children}
    </ul>
  )
}

export default Grid
