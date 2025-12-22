# UX Methods API
Where possible, UX Methods relies on ready-made micro-services and APIs for its core functionality. Occasionally, however, situations arise where it's easier to write a script to do one thing particularly well than to try to cobble together a bunch of services to do something none of them really want to do. That's what this part of the project is for. 

> [!NOTE]
> Custom API endpoints were used in the 11ty version of UX Methods, pre-2025. As of the migration to Astro, the functions described below have been moved to Sanity functions. New API needs that are not appropriate for Sanity Functions will likely be integrated with Astro's API functionality. 

## Linked Data Fetch


In addition to information on individual methods and disciplines, UX Methods also collects links to resources from across the web that add detail, nuance, and examples to particular techniques and approaches. In order to give these links useful context and help site visitors understand what's behind them, we collect and display metadata about each link including the author, publication, a short description, and an image. 

Finding and copying all this data, however, is a pain&mdash;especially if one is adding a lot of links at the same time. Since most articles online these days include linked data representations of this metadata, this is also a job that _computers_ should be doing (not content contributors).

The "LD" API endpoint takes the URL of a resource that has been entered in the editor, grabs linked data from the target site using the [metascraper](https://www.npmjs.com/package/metascraper) library, then uploads what metadata it finds to the resource in question via the [Sanity HTTP API](https://www.sanity.io/docs/http-api). Images are likewise uploaded via [Sanity's Assets API](https://www.sanity.io/docs/http-api-assets). 

![Linked Data upload gif](https://user-images.githubusercontent.com/3710835/156894260-07972db3-8fa7-4ff9-9d4b-c916c4a7a9ca.gif)