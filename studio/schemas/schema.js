// First, we must import the schema creator
import createSchema from 'part:@sanity/base/schema-creator'

// Then import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type'

// Document schemas
import method from './documents/method'
import resource from './documents/resource'
import discipline from './documents/discipline'
import concept from './concepts/concept'
import siteSettings from './documents/siteSettings'

// Object schemas
import bodyPortableText from './objects/bodyPortableText'
import bodyImage from './objects/bodyImage'
import heroImage from './objects/heroImage'
import referencedDiscipline from './objects/referencedDiscipline'
import transputReference from './objects/transputReference'
import referencedInput from './objects/referencedInput'
import referencedOutput from './objects/referencedOutput'
import describedMethod  from './objects/describedMethod'
import publisher from './objects/publisher'
import conceptScheme from './concepts/conceptScheme'

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: 'ux-methods',
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    // The following are document types which will appear
    // in the studio.
    method,
    resource,
    discipline,
    concept,
    siteSettings,
    referencedDiscipline,
    transputReference,
    referencedInput,
    referencedOutput,
    describedMethod,
    publisher,
    conceptScheme,
    bodyPortableText,
    bodyImage,
    heroImage
  ]),
})
