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
	<!-- Add badge for "Preview" -->
	<!-- <img src="https://github.com/andybywire/ux-methods/actions/workflows/build-staging.yml/badge.svg"/>
	<img src="https://github.com/andybywire/ux-methods/actions/workflows/build-studio.yml/badge.svg"/> -->
</p>
<br />

## Overview
[UX Methods](https://www.uxmethods.org/) is a content-first Jamstack website built using [Sanity](https://www.sanity.io/) and the [Astro](https://astro.build) web framework, and coordinated with a lightweight knowledge graph running on an [Apache Jena TDB2](https://jena.apache.org/documentation/tdb2/) triplestore. 

The goal of this project is to:

- Document and interconnect the practices and techniques of user experience design
- Provide a demonstration of the emerging practices of structured content design, composable content publishing, and content-focused knowledge graph integration 

This repository is a monorepo of three interrelated components: content management, web applications, and knowledge graph curation and integration.

## Content Curation
UX Methods is built and maintained as a content-first resource. This means that content is structured to communicate meaning based on user and organization needs, not around the web requirements of particular "pages." UX Methods uses Sanity, a fully decoupled headless content operations platform, to produce, curate, and distribute content. 

<h3 align="center">
<img width="500" src="https://user-images.githubusercontent.com/3710835/146045406-6413d563-bf66-4b2c-b40a-f40b9e19b759.png" alt="Screenshot of UXMethods.org website on desktop and mobile">
</h3>
<br />

> [!NOTE]
> Include image of visual editing preview here. 

## Web Applications
UX Methods uses the Astro web framework for fast, accessible static site generation (progressive web app) and dynamic server-side pages for real-time previews in Sanity's Visual Editing feature. 

<h3 align="center">
<img width="500" src="https://user-images.githubusercontent.com/3710835/145917429-72a8347a-84ab-4c39-9b12-9c101f30b41d.png" alt="Screenshot of UXMethods.org website on desktop and mobile">
</h3>
<br />

## Ontologies
A purpose-built UX Methods ontology provides the conceptual backbone of the UX Methods knowledge graph. It is supported by several standard utility ontologies, all of which are loaded, along with RDF serialized UX Methods content, into a free-standing TDB2 triple store. This endpoint is used to coordinate content relationships and ensure content integrity, and to support direct queries against the knowledge graph.