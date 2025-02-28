import React from 'react';
import * as s from './grid.module.scss';

const Grid = ({ children, style }) => {

  const gridStyle =
    (style === 'dark') ? [s.grid, s.dark].join(' ') : s.grid;

  return(
    <ul className={gridStyle}>
      {children}
    </ul>
  )
}

export default Grid
