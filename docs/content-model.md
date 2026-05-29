# Content model

> Auto-generated from the Sanity Studio schema. Do not edit by hand — re-run `pnpm --filter uxmethods-graph export:content-model` to refresh. See [ADR 0006](decisions/0006-content-model-mermaid-export.md) for the contract.

```mermaid
classDiagram
  class Discipline {
    <<document>>
    +title: string [0..1]
    +slug: string [0..1]
    +uri: string [0..1]
    +dateStamps: DateStamps [0..1]
    +metaDescription: string [0..1]
    +heroImage: HeroImage [0..1]
    +overview: PortableText [0..1]
  }
  class Documentation {
    <<document>>
    +title: string [0..1]
    +slug: string [0..1]
    +metaDescription: string [0..1]
    +heroImage: HeroImage [0..1]
    +body: PortableText [0..1]
  }
  class Method {
    <<document>>
    +title: string [0..1]
    +slug: string [0..1]
    +topics: SkosConcept [0..*]
    +uri: string [0..1]
    +dateStamps: DateStamps [0..1]
    +metaDescription: string [0..1]
    +heroImage: HeroImage [0..1]
    +disciplinesReference: Discipline [0..*]
    +overview: PortableText [0..1]
    +overviewSources: Source [0..*]
    +steps: PortableText [0..1]
    +stepSources: Source [0..*]
    +input: SkosConcept [0..*]
    +output: SkosConcept [0..*]
  }
  class Newsletter {
    <<document>>
    +title: string [0..1]
    +body: string [0..1]
    +resources: Resource [0..*]
  }
  class Resource {
    <<document>>
    +resourceUrl: string [0..1]
    +title: string [0..1]
    +author: string [0..1]
    +publisher: Publisher [0..1]
    +pubDate: string [0..1]
    +metaDescription: string [0..1]
    +methodDescribed: Method [0..*]
    +ldMetadata: LdMetadata [0..1]
  }
  class SiteSettings {
    <<document>>
    +title: string [0..1]
    +tagline: string [0..1]
    +description: string [0..1]
    +metaDescription: string [0..1]
    +socialMediaLinks: SocialMedia [0..*]
    +credits: Credit [0..*]
  }
  class SkosConcept {
    <<document>>
    +prefLabel: string [0..1]
    +definition: string [0..1]
    +example: string [0..1]
    +scopeNote: string [0..1]
    +altLabel: string [0..*]
    +hiddenLabel: string [0..*]
    +baseIri: string [0..1]
    +conceptId: string [0..1]
    +broader: SkosConcept [0..*]
    +related: SkosConcept [0..*]
    +historyNote: string [0..1]
    +editorialNote: string [0..1]
    +changeNote: string [0..1]
  }
  class SkosConceptScheme {
    <<document>>
    +title: string [0..1]
    +description: string [0..1]
    +controls: boolean [0..1]
    +baseIri: string [0..1]
    +schemeId: string [0..1]
    +topConcepts: SkosConcept [0..*]
    +concepts: SkosConcept [0..*]
  }
  class TaxonomyTest {
    <<document>>
    +title: string [0..1]
    +metaDescription: string [0..1]
    +singleTermFromScheme: SkosConcept [0..1]
    +testField: string [0..1]
    +singleTermFromSchemeNoTop: SkosConcept [0..1]
    +singleTermFromBranchNoTop: SkosConcept [0..1]
    +singleTermFromBranch: SkosConcept [0..1]
    +arrayFromScheme: SkosConcept [0..*]
    +arrayFromBranch: SkosConcept [0..*]
  }
  class BodyImage {
    <<object>>
    +caption: string [0..1]
    +alt: string [0..1]
  }
  class Credit {
    <<object>>
    +title: string [0..1]
  }
  class DateStamps {
    <<object>>
    +createdAt: string [0..1]
    +revisedAt: string [0..1]
  }
  class HeroImage {
    <<object>>
    +caption: string [0..1]
    +alt: string [0..1]
  }
  class LdMetadata {
    <<object>>
    +ldIsUpdating: boolean [0..1]
    +ldLastUpdated: string [0..1]
    +ldLastRequested: string [0..1]
    +ldUpdateIssue: string [0..1]
  }
  class Publisher {
    <<object>>
    +pubName: string [0..1]
    +pubUrl: string [0..1]
  }
  class ResourceUrlLd {
    <<object>>
    +resourceUrl: string [0..1]
    +ldLastUpdated: string [0..1]
    +ldLastRequested: string [0..1]
    +ldIsUpdating: boolean [0..1]
    +ldUpdateIssue: string [0..1]
  }
  class SocialMedia {
    <<object>>
    +title: string [0..1]
    +link: string [0..1]
  }
  class Source {
    <<object>>
    +name: string [0..1]
    +source: string [0..1]
  }
  Discipline *-- DateStamps : dateStamps
  Discipline *-- HeroImage : heroImage
  Documentation *-- HeroImage : heroImage
  Method *-- DateStamps : dateStamps
  Method --> Discipline : disciplinesReference
  Method *-- HeroImage : heroImage
  Method --> SkosConcept : input
  Method --> SkosConcept : output
  Method *-- Source : overviewSources
  Method *-- Source : stepSources
  Method --> SkosConcept : topics
  Newsletter --> Resource : resources
  Resource *-- LdMetadata : ldMetadata
  Resource --> Method : methodDescribed
  Resource *-- Publisher : publisher
  SiteSettings *-- Credit : credits
  SiteSettings *-- SocialMedia : socialMediaLinks
  SkosConcept --> SkosConcept : broader
  SkosConcept --> SkosConcept : related
  SkosConceptScheme --> SkosConcept : concepts
  SkosConceptScheme --> SkosConcept : topConcepts
  TaxonomyTest --> SkosConcept : arrayFromBranch
  TaxonomyTest --> SkosConcept : arrayFromScheme
  TaxonomyTest --> SkosConcept : singleTermFromBranch
  TaxonomyTest --> SkosConcept : singleTermFromBranchNoTop
  TaxonomyTest --> SkosConcept : singleTermFromScheme
  TaxonomyTest --> SkosConcept : singleTermFromSchemeNoTop
  classDef document fill:#1976d2,color:#fff
  classDef object fill:#757575,color:#fff
  class Discipline document
  class Documentation document
  class Method document
  class Newsletter document
  class Resource document
  class SiteSettings document
  class SkosConcept document
  class SkosConceptScheme document
  class TaxonomyTest document
  class BodyImage object
  class Credit object
  class DateStamps object
  class HeroImage object
  class LdMetadata object
  class Publisher object
  class ResourceUrlLd object
  class SocialMedia object
  class Source object
```
