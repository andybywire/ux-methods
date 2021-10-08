import React from 'react'
import * as queryString from 'query-string'
import Method from '../../components/method'

const sanityClient = require('@sanity/client');
const client = sanityClient({
  projectId: "4g5tw1k0",
  dataset: "production",
  apiVersion: '2021-03-25',
  useCdn: false, // `false` ensures fresh data
  withCredentials: true
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
        overview,
        steps
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
      // This will work fine until I need to see live updates to referenced
      // documents' data. Then I'll need to re-run the initial query.
      this.setState({
        data: update.result
      });
    })
  }
  // consider integrating [...].js / @reach/router here when I need to
  // choose between different components to render based on content type.
  render() {
    return (
      <div>
        <Method data={this.state.data}>
          Here's a child, yo!
        </Method>
      </div>
    );
  }
}
