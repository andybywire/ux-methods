import React from 'react'
import { Link } from "gatsby"
import PortableText from "./portableText"
import SanityImage from "gatsby-plugin-sanity-image"

const Method = ({ data }) => {
  return (
    <div>
      <h2>{data.title}</h2>
      {/*<p>{data.metaDescription}</p>*/}
      {data.heroImage &&
        <SanityImage {...data.heroImage} width={500} alt=""
          style={{
          width: "100%",
          objectFit: "cover",
        }}/>
      }
      <PortableText blocks={data.overview} />
      <PortableText blocks={data.steps} />
      <Link to='/'>Back to Index</Link>
      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
    </div>
  );
}

export default Method
Image'
    },
    {
      name: 'disciplinesReference',
      type: 'array',
      title: 'Discipline(s)',
      description: 'List the disciplines in which this method is most commonly used.',
      of: [{ type: 'referencedDiscipline'}]
    },
    {
      name: 'overview',
      type: 'bodyPortableText',
      title: 'Method Overview'
    },
    {
      name: 'steps',
      type: 'bodyPortableText',
      title: 'Method Steps'
    },
    {
      name: 'transputReference',
      type: 'transputReference',
      title: 'Input/Output'
    }
  ],
  preview: {
    select: {
      title: 'title',
      thumb: 'heroImage',
      discipline0: 'disciplinesReference.0.title',
      discipline1: 'disciplinesReference.1.title',
      discipline2: 'disciplinesReference.2.title',
      discipline3: 'disciplinesReference.3.title',
    },
    prepare(selection) {
      const {title, discipline0, discipline1, discipline2, discipline3, thumb} = selection
      const disciplines = [discipline0, discipline1, discipline2, discipline3].filter(Boolean)
      const subtitle = disciplines.length > 0 ? `${disciplines.join(', ')}` : ''
      return {
        title: title,
        subtitle: subtitle,
        media: thumb ? thumb : RiGitCommitLine
      }
    }
  }
}
