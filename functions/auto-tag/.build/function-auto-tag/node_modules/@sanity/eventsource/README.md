# @sanity/eventsource

[![npm stat](https://img.shields.io/npm/dm/@sanity/eventsource.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@sanity/eventsource)
[![npm version](https://img.shields.io/npm/v/@sanity/eventsource.svg?style=flat-square)](https://www.npmjs.com/package/@sanity/eventsource)
[![gzip size][gzip-badge]][bundlephobia]
[![size][size-badge]][bundlephobia]

Meta-package to make browsers and Node use different EventSource polyfills

```sh
npm install @sanity/eventsource
```

## Usage

```ts
import polyfilledEventSource from '@sanity/eventsource'
```

The polyfill adds support for auth headers, which isn't part of the EventSource spec.

In NodeJS environments it's the implementation from [eventsource](https://www.npmjs.com/package/eventsource) package. While browsers use [event-source-polyfill](https://www.npmjs.com/package/event-source-polyfill).

### Forcing a specific implementation

To get the browser implementation, no matter how your bundler or runtime understands `package.json` `exports`, you can use the following:

```ts
import polyfilledEventSource from '@sanity/eventsource/browser'
```

To force the Node implementation, use the following:

```ts
import polyfilledEventSource from '@sanity/eventsource/node'
```

## License

MIT © [Sanity.io](https://www.sanity.io/)

[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/eventsource?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/eventsource?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/eventsource
