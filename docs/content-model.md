# Content model

> Auto-generated from the Sanity Studio schema. Do not edit by hand — re-run `pnpm --filter uxmethods-content-model generate` to refresh. See [ADR 0006](decisions/0006-content-model-mermaid-export.md) for the contract.

```mermaid
classDiagram
  class Discipline:::document {
    <<document>>
    +title: string [0..1]
    +slug: string [1]
    +uri: string [1]
    +dateStamps: DateStamps [0..1]
    +metaDescription: string [1]
    +heroImage: HeroImage [0..1]
    +overview: BodyPortableText [0..1]
  }
  class Documentation:::document {
    <<document>>
    +title: string [0..1]
    +slug: string [1]
    +metaDescription: string [1]
    +heroImage: HeroImage [0..1]
    +body: BodyPortableText [0..1]
  }
  class Method:::document {
    <<document>>
    +title: string [0..1]
    +slug: string [1]
    +topics: SkosConcept [0..*]
    +uri: string [1]
    +dateStamps: DateStamps [0..1]
    +metaDescription: string [1, custom]
    +heroImage: HeroImage [0..1]
    +disciplinesReference: Discipline [0..*]
    +overview: BodyPortableText [0..1]
    +overviewSources: Source [0..*]
    +steps: BodyPortableText [0..1]
    +stepSources: Source [0..*]
    +input: SkosConcept [0..*]
    +output: SkosConcept [0..*]
  }
  class Newsletter:::document {
    <<document>>
    +title: string [0..1]
    +body: string [0..1]
    +resources: Resource [0..*]
    +inlineSocialMediaBlock: InlineSocialMediaBlock [0..1]
  }
  class Resource:::document {
    <<document>>
    +resourceUrl: url [0..1]
    +title: string [0..1]
    +author: string [0..1]
    +publisher: Publisher [0..1]
    +pubDate: datetime [0..1]
    +metaDescription: string [0..1]
    +methodDescribed: Method [0..*]
    +ldMetadata: LdMetadata [0..1]
  }
  class SiteSettings:::document {
    <<document>>
    +title: string [0..1]
    +tagline: string [0..1]
    +description: string [0..1]
    +metaDescription: string [0..1]
    +overview: PortableText [0..1]
    +colophon: PortableText [0..1]
    +socialMediaLinks: SocialMedia [0..*]
    +credits: Credit [0..*]
  }
  class TaxonomyTest:::document {
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
  class BodyImage:::object {
    <<object>>
    +asset: url [1]
    +caption: string [0..1]
    +alt: string [0..1]
  }
  class BodyPortableText:::object {
    <<object>>
    +block: PortableText [0..*]
    +bodyImage: BodyImage [0..*]
  }
  class Credit:::object {
    <<object>>
    +title: string [0..1]
    +creditBody: PortableText [0..1]
  }
  class DateStamps:::object {
    <<object>>
    +createdAt: datetime [0..1]
    +revisedAt: datetime [0..1]
  }
  class HeroImage:::object {
    <<object>>
    +asset: url [1]
    +caption: string [0..1]
    +alt: string [0..1]
  }
  class InlineSocialMediaBlock:::object {
    <<object>>
    +title: string [0..1]
    +link: url [0..1]
  }
  class LdMetadata:::object {
    <<object>>
    +ldIsUpdating: boolean [0..1]
    +ldLastUpdated: datetime [0..1]
    +ldLastRequested: datetime [0..1]
    +ldUpdateIssue: string [0..1]
  }
  class Publisher:::object {
    <<object>>
    +pubName: string [0..1]
    +pubUrl: url [0..1]
  }
  class ResourceUrlLd:::object {
    <<object>>
    +resourceUrl: url [0..1]
    +ldLastUpdated: datetime [0..1]
    +ldLastRequested: datetime [0..1]
    +ldIsUpdating: boolean [0..1]
    +ldUpdateIssue: string [0..1]
  }
  class SocialMedia:::object {
    <<object>>
    +title: string [0..1]
    +link: url [0..1]
  }
  class Source:::object {
    <<object>>
    +name: string [0..1]
    +source: url [0..1]
  }
  BodyPortableText *-- BodyImage : bodyImage
  Discipline *-- DateStamps : dateStamps
  Discipline *-- HeroImage : heroImage
  Discipline *-- BodyPortableText : overview
  Documentation *-- BodyPortableText : body
  Documentation *-- HeroImage : heroImage
  Method *-- DateStamps : dateStamps
  Method --> Discipline : disciplinesReference
  Method *-- HeroImage : heroImage
  Method *-- BodyPortableText : overview
  Method *-- Source : overviewSources
  Method *-- BodyPortableText : steps
  Method *-- Source : stepSources
  Newsletter *-- InlineSocialMediaBlock : inlineSocialMediaBlock
  Newsletter --> Resource : resources
  Resource *-- LdMetadata : ldMetadata
  Resource --> Method : methodDescribed
  Resource *-- Publisher : publisher
  SiteSettings *-- Credit : credits
  SiteSettings *-- SocialMedia : socialMediaLinks
  classDef document fill:#2276FC,stroke:#7AACFD,color:#fff
  classDef object fill:#7B8CA8,stroke:#AFBACA,color:#fff
```
