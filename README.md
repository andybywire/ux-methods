<h1 align="center">
<img src="https://user-images.githubusercontent.com/3710835/145916510-9a2a8af3-38a9-4c87-9e7d-e1d0bd4f6040.png" alt="UX Methods.org wordmark">
</h1>
<h3 align="center">
The User Experience Practices Knowledge Graph
</h3>

<p align="center">
	<strong>
		<a href="#content-management">Fully Decoupled CMS</a>
		•
		<a href="#progressive-web-app">Progressive Web App</a>
  		•
		<a href="#knowledge-graph-integration-and-continuous-integration-workflows">Knowledge Graph & CI Workflows</a>
	</strong>
</p>
<p align="center">
	<img src="https://github.com/andybywire/ux-methods/actions/workflows/build-prod.yml/badge.svg"/>
	<!-- <img src="https://github.com/andybywire/ux-methods/actions/workflows/build-staging.yml/badge.svg"/>
	<img src="https://github.com/andybywire/ux-methods/actions/workflows/build-studio.yml/badge.svg"/> -->
</p>
<br />

## Overview
[UX Methods](https://www.uxmethods.org/) is a content-first Jamstack website built with [Sanity](https://www.sanity.io/) and [11ty](https://www.11ty.dev/), and coordinated with a lightweight knowledge graph running on [Data.world](https://data.world/). Its goal is to document and interconnect the practices and techniques of user experience design, and to provide a use case from which to explore the possibilities of ["boutique" knowledge graphs](https://www.linkedin.com/pulse/uxmethodsorg-boutique-knowledge-graph-case-study-andy-fitzgerald/?trackingId=FsKbRBiJS9SiKWq3uiBDug%3D%3D). 

This repository is a monorepo of three interrelated but distinct pieces: content management, web application, and continuous integration, which includes knowledge graph production and integration.
<br />

## Content Management
UX Methods is built and maintained as a content-first resource. This means that content is structured to communicate meaning based on user and organization needs, not around the web requirements of particular "pages." UX Methods uses the fully decoupled headless CMS Sanity to structure, produce, and distribute content. This functionality is located in the [**studio**](https://github.com/andybywire/ux-methods/tree/main/studio) folder of this repository. 

<h3 align="center">
<img width="500" src="https://user-images.githubusercontent.com/3710835/146045406-6413d563-bf66-4b2c-b40a-f40b9e19b759.png" alt="Screenshot of UXMethods.org website on desktop and mobile">
</h3>
<br />

## Progressive Web App
UX Methods uses the 11ty static site generator to publish content as a progressive web app (PWA). 11ty is also used to publish content as Linked Data (JSON-LD) in parallel with HTML pages in order to support content findability, interoperability, and reuse. PWA code is located in the [**web**](https://github.com/andybywire/ux-methods/tree/main/web) folder. 

<h3 align="center">
<img width="500" src="https://user-images.githubusercontent.com/3710835/145917429-72a8347a-84ab-4c39-9b12-9c101f30b41d.png" alt="Screenshot of UXMethods.org website on desktop and mobile">
</h3>
<br />

## Knowledge Graph Integration and Continuous Integration Workflows
GitHub Actions workflows are used to [build and publish updates](https://github.com/andybywire/ux-methods/tree/main/.github/workflows) to the UX Methods PWA when content is added or updated. A custom [RDF-Transform GitHub Action](https://github.com/andybywire/ux-methods/tree/main/actions/rdf-transform) and workflow are also used to transform content data from the Sanity headless CMS content API into RDF triples, then upload those triples to the [UX Methods dataset on Data.world](https://data.world/andyfitzgerald/ux-methods). This dataset is queried during the PWA build workflow and used to coordinate the related content recommendations and prioritization.
