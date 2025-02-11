// Add keys the keys and values defined in .env to process.env
// import 'dotenv/config'

import "tsx/esm";
import { renderToStaticMarkup } from "react-dom/server";

// Filter & Shortcode imports
// TBD

// Plugins
// import pluginRss from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {

	eleventyConfig.addExtension(["11ty.jsx", "11ty.ts", "11ty.tsx"], {
		key: "11ty.js",
		compile: function () {
			return async function (data) {
				let content = await this.defaultRenderer(data);
				return renderToStaticMarkup(content);
			};
		},
	});

  eleventyConfig.addTemplateFormats("11ty.jsx,11ty.tsx")



  // eleventyConfig.addPassthroughCopy('.htaccess')
  // eleventyConfig.addPassthroughCopy('style')
  // eleventyConfig.addPassthroughCopy('assets')
  // eleventyConfig.addPassthroughCopy('serviceworker.js')
  // eleventyConfig.addPassthroughCopy({'assets/js': 'js'})
  // eleventyConfig.addPassthroughCopy({'assets/icons': 'icons'})
  // eleventyConfig.addPassthroughCopy('manifest.json')
  // eleventyConfig.addPassthroughCopy('robots.txt');

  // Shortcodes
  // eleventyConfig.addShortcode('responsiveImage', responsiveImage)
  // eleventyConfig.addShortcode('imageUrlFor', imageUrlFor)

  // Filters
  // eleventyConfig.addFilter('date', dateFilter) // Moment.js
  // eleventyConfig.addFilter('embeddedContent', embeddedContent)

  // RSS feed
  // eleventyConfig.addPlugin(pluginRss)

  eleventyConfig.setServerOptions({
    // watch: ['style/**/*.css'],
    showAllHosts: true,
  })

  return {
    htmlTemplateEngine: 'njks, 11ty.js, 11ty.jsx',
    dir: {
      data: '../_data',
      input: '_src',
      includes: '../_includes',
      layouts: '../_layouts',
    },
  }
}
