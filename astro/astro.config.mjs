// @ts-check
import {defineConfig} from "astro/config";

import sanity from "@sanity/astro";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [
    sanity({
      projectId: '4g5tw1k0',
      dataset: 'production',
      useCdn: false, 
      apiVersion: "2025-11-01",
      // studioBasePath: "/studio", // If you want to access the Studio on a route
      // stega: {
      //   studioUrl: "/studio",
      // },
    }),
    ,
    react(),
  ],
});
