import React from 'react'
import * as queryString from 'query-string'

const sanityClient = require('@sanity/client');
const client = sanityClient({
  projectId: "4g5tw1k0",
  dataset: "production",
  apiVersion: '2021-03-25'
});

export default class PreviewTemplate extends React.Component {

  constructor(props) {
    super(props);
    this.state = { ...this.props, data: "Loading" };
  }

  componentDidMount() {
    const pageSlug = queryString.parse(this.state.location.search).page;
    const query = `*[slug.current == "${pageSlug}"]
      {
        _id,
        title,
        metaDescription,
        overview
      }`;
    const getData = async () => {
        const method = await client.fetch(query);
        const currentMethod = await method[1] || method[0];
        this.setState({
          data: currentMethod
        });
    }
    const listener = `*[slug.current == "${pageSlug}"]`;
    getData();
    client.listen(listener, {}, {includeResult: true}).subscribe((update) => {
      this.setState({
        data: update.result
      });
    })
  }

  render() {
    return (
      <div>
        <pre>Returned Data: {JSON.stringify(this.state.location, null, 2)}</pre>
        <p>{queryString.parse(this.state.location.search).page}</p>
        <p>{this.state.data.title}</p>
        <p>{this.state.data.metaDescription}</p>
        <pre>{JSON.stringify(this.state.data.overview, null, 2)}</pre>
      </div>
    );
  }
}
