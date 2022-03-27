// First, we must import the schema creator
import createSchema from 'part:@sanity/base/schema-creator'

// Then import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type'

// Document schemas
import method from './documents/method'
import resource from './documents/resource'
import discipline from './documents/discipline'
import article from './documents/article'
import siteSettings from './documents/siteSettings'

// Object schemas
import bodyPortableText from './objects/bodyPortableText'
import bodyImage from './objects/bodyImage'
import heroImage from './objects/heroImage'
import referencedDiscipline from './objects/referencedDiscipline' // can be simplified w/ a direct relationship
import describedMethod  from './objects/describedMethod' // can be simplified w/ a direct relationship
import publisher from './objects/publisher'
import source from './objects/source'
import credit from './objects/credit'
import socialMedia from './objects/socialMedia'
import dateStamps from './objects/dateStamps'

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: 'ux-methods',
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    // The following are document types which will appear
    // in the studio. Also sets the order of items in Desk view.
    method,
    discipline,
    resource,
    article,
    siteSettings,
    referencedDiscipline,
    describedMethod,
    publisher,
    bodyPortableText,
    bodyImage,
    heroImage,
    source,
    credit,
    socialMedia,
    dateStamps
  ]),
})
