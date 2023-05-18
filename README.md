[![cover][cover-src]][cover-href]
[![npm version][npm-version-src]][npm-version-href] 
[![npm downloads][npm-downloads-src]][npm-downloads-href] 
[![bundle][bundle-src]][bundle-href] [![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

# 🧙‍♂️ fetchwizard

> Experience an upgraded fetch API 🌐. Operates seamlessly on node, browsers, and workers 💻🌍🛠️.

## 🕒 Quick Start

Install:

```bash
# nyxi
nyxi fetchwizard

#pnpm
pnpm add fetchwizard

# npm
npm i fetchwizard

# yarn
yarn add fetchwizard
```

Import:

```ts
// ESM / Typescript
import { fetchwizard } from 'fetchwizard'

// CommonJS
const { fetchwizard } = require('fetchwizard')
```

## ⚙️ Works with Node.js

We use [conditional exports](https://nodejs.org/api/packages.html#packages_conditional_exports) to detect Node.js
and automatically use [nyxblabs/fetch-for-all](https://github.com/nyxblabs/fetch-for-all). If `globalThis.fetch` is available, it will be used instead. To leverage Node.js 17.5.0 experimental native fetch API, use the 🔬 `--experimental-fetch` flag.

### ⏳ `keepAlive` support

By setting the `FETCH_KEEP_ALIVE` environment variable to `true`, an ⚡️ http/https agent will be registered that keeps sockets around even when there are no outstanding requests, so they can be used for future requests without having to reestablish a TCP connection.

**Note:** This option can potentially introduce memory leaks. Please check [node-fetch/node-fetch#1325](https://github.com/node-fetch/node-fetch/pull/1325).

## 📚 Parsing Response

`fetchwizard` will smartly parse JSON and native values using [nyxjson](https://github.com/nyxblabs/nyxjson), falling back to text if it fails to parse.

```ts
const { users } = await fetchwizard('/api/users')
```

For binary content types, `fetchwizard` will instead return a 📦 `Blob` object.

You can optionally provide a different parser than destr, or specify `📦 blob`, `🧱 arrayBuffer` or `📝 text` to force parsing the body with the respective `FetchResponse` method.

```ts
// Use JSON.parse
await fetchwizard('/movie?lang=en', { parseResponse: JSON.parse })

// Return text as is
await fetchwizard('/movie?lang=en', { parseResponse: txt => txt })

// Get the blob version of the response
await fetchwizard('/api/generate-image', { responseType: 'blob' })
```

## 📝 JSON Body

`fetchwizard` automatically stringifies the request body (if an object is passed) and adds JSON 📋 `Content-Type` and 📥 `Accept` headers (for `put`, `patch`, and `post` requests).

```ts
const { users } = await fetchwizard('/api/users', { method: 'POST', body: { some: 'json' } })
```

## ❌ Handling Errors

`fetchwizard` automatically throws errors when `response.ok` is `false` with a friendly error message and compact stack (hiding internals).

Parsed error body is available with `error.data`. You may also use the `FetchError` type.

```ts
await fetchwizard('http://google.com/404')
// FetchError: 404 Not Found (http://google.com/404)
//     at async main (/project/playground.ts:4:3)
```

In order to bypass errors as response you can use `error.data`:

```ts
await fetchwizard(...).catch((error) => error.data)
```

## 🔁 Auto Retry

`fetchwizard` automatically retries the request if an error occurs. The default number of retries is `1` (except for `POST`, `PUT`, `PATCH`, and `DELETE` methods, which have a default of `0` retries).

```ts
await fetchwizard('http://google.com/404', {
   retry: 3
})
```

## ✨ Type Friendly

Responses can be type-assisted:

```ts
const article = await fetchwizard<Article>(`/api/article/${id}`)
// Auto complete working with article.id
```

## 🌐 Adding `baseURL`

By using the `baseURL` option, `fetchwizard` prepends it while respecting trailing/leading slashes and query search parameters for baseURL using [url-ops](https://github.com/nyxblabs/url-ops):

```ts
await fetchwizard('/config', { baseURL })
```

## 🔍 Adding Query Search Params

By using the `query` option (or `params` as an alias), `fetchwizard` adds query search parameters to the URL by preserving the query in the request itself using [url-ops](https://github.com/nyxblabs/url-ops):

```ts
await fetchwizard('/movie?lang=en', { query: { id: 123 } })
```

## ⚡️ Interceptors

It is possible to provide async interceptors to hook into the lifecycle events of `fetchwizard` calls.

You might want to use `fetchwizard.create` to set shared interceptors.

### 🚀 `onRequest({ request, options })`

The `onRequest` interceptor is called as soon as `fetchwizard` is being called, allowing you to modify options or perform simple logging.

```ts
await fetchwizard('/api', {
   async onRequest({ request, options }) {
      // Log request
      console.log('[fetch request]', request, options)

      // Add `?t=1640125211170` to query search params
      options.query = options.query || {}
      options.query.t = new Date()
   }
})
```

### ❌ `onRequestError({ request, options, error })`

The `onRequestError` interceptor will be called when the fetch request fails.

```ts
await fetchwizard('/api', {
   async onRequestError({ request, options, error }) {
      // Log error
      console.log('[fetch request error]', request, error)
   }
})
```


### ✅ `onResponse({ request, options, response })`

The `onResponse` interceptor will be called after the `fetch` call and parsing the response body.

```ts
await fetchwizard('/api', {
   async onResponse({ request, response, options }) {
      // Log response
      console.log('[fetch response]', request, response.status, response.body)
   }
})
```

### ❌ `onResponseError({ request, options, response })`

The `onResponseError` interceptor is similar to `onResponse`, but it will be called when the fetch request is successful (`response.ok` is not `true`).

```ts
await fetchwizard('/api', {
   async onResponseError({ request, response, options }) {
      // Log error
      console.log('[fetch response error]', request, response.status, response.body)
   }
})
```

## 🔧 Create fetch with default options

This utility is useful if you need to use common options across several fetch calls.

**Note:** Defaults will be cloned at one level and inherited. Be careful with nested options like `headers`.

```ts
const apiFetch = fetchwizard.create({ baseURL: '/api' })

apiFetch('/test') // Same as fetchwizard('/test', { baseURL: '/api' })
```

## 📝 Adding headers

By using the `headers` option, `fetchwizard` adds extra headers in addition to the default headers of the request:

```ts
await fetchwizard('/movies', {
   headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
   }
})
```

## 🌐 Adding HTTP(S) Agent

If you need to use an HTTP(S) Agent, you can add the `agent` option with `https-proxy-agent` (for Node.js only):

```ts
import { HttpsProxyAgent } from 'https-proxy-agent'

await fetchwizard('/api', {
   agent: new HttpsProxyAgent('http://example.com')
})
```

## 🔍 Access to Raw Response

If you need to access the raw response (for headers, etc.), you can use `fetchwizard.raw`:

```ts
const response = await fetchwizard.raw('/sushi')

// response._data
// response.headers
// ...
```

## 🚀 Native fetch

As a shortcut, you can use `fetchwizard.native` which provides the native `fetch` API.

```ts
const json = await fetchwizard.native('/sushi').then(r => r.json())
```

## 📦 Bundler Notes

- ✨ All targets are exported with Module and CommonJS format and named exports
- ⚙️ No export is transpiled for the sake of modern syntax
  - 🔄 You probably need to transpile `fetchwizard`, `destr`, and `ufo` packages with babel for ES5 support
- 📥 You need to polyfill `fetch` global for supporting legacy browsers like using [unfetch](https://github.com/developit/unfetch)


## ❓ FAQ

**❔ Why export is called `fetchwizard` instead of `fetch`?**

Using the same name of `fetch` can be confusing since API is different but still it is a fetch so using closest possible alternative. You can however, import `{ fetch }` from `fetchwizard` which is auto polyfilled for Node.js and using native otherwise. 🔀

**❔ Why not having default export?**

Default exports are always risky to be mixed with CommonJS exports. ⚠️

This also guarantees we can introduce more utils without breaking the package and also encourage using `fetchwizard` name. 📦

**❔ Why not transpiled?**

By keep transpiling libraries we push web backward with legacy code which is unneeded for most of the users. ⏮️

If you need to support legacy users, you can optionally transpile the library in your build pipeline. ⚙️

## 📜 License

[MIT](./LICENSE) - Made with 💞

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/fetchwizard?style=flat&colorA=18181B&colorB=14F195
[npm-version-href]: https://npmjs.com/package/fetchwizardfetchwizard
[npm-downloads-src]: https://img.shields.io/npm/dm/fetchwizard?style=flat&colorA=18181B&colorB=14F195
[npm-downloads-href]: https://npmjs.com/package/fetchwizard
[bundle-src]: https://img.shields.io/bundlephobia/minzip/fetchwizardfetchwizard?style=flat&colorA=18181B&colorB=14F195
[bundle-href]: https://bundlephobia.com/result?p=fetchwizard
[jsdocs-src]: https://img.shields.io/badge/jsDocs.io-reference-18181B?style=flat&colorA=18181B&colorB=14F195
[jsdocs-href]: https://www.jsdocs.io/package/fetchwizard
[license-src]: https://img.shields.io/github/license/nyxblabs/fetchwizard.svg?style=flat&colorA=18181B&colorB=14F195
[license-href]: https://github.com/nyxblabs/fetchwizard/blob/main/LICENSE

<!-- Cover -->
[cover-src]: https://raw.githubusercontent.com/nyxblabs/fetchwizard/main/.github/assets/cover-github-fetchwizard.png
[cover-href]: https://💻nyxb.ws
