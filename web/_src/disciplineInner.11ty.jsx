import React, {Component} from 'react'

class DisciplineInner extends Component {
  data() {
    return {
      layout: 'discipline.njk',
			// permalink: function (data) {
			// 	return `/${this.slug(data.title)}/`;
			// },
      // can't get these permalinks to work
      // keep getting a `link.slice is not a function` error
    }
  }

  render(data) {
    return (
      <div>
        <h1>{data.discipline.title}</h1>
        <p>{data.discipline.metaDescription}</p>
      </div>
    )
  }
}

export default DisciplineInner
