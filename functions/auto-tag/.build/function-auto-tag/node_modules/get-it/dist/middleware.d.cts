import {AgentOptions} from 'http'
import {FinalizeNodeOptionsPayload as FinalizeNodeOptionsPayload_2} from 'get-it'
import {HookOnRequestEvent} from 'get-it'
import {HttpContext} from 'get-it'
import {IncomingHttpHeaders} from 'http'
import {IncomingMessage} from 'http'
import {MiddlewareChannels as MiddlewareChannels_2} from 'get-it'
import {MiddlewareResponse} from 'get-it'
import {ProgressStream as ProgressStream_2} from '../../util/progress-stream'
import {ProxyOptions as ProxyOptions_2} from 'get-it'
import {RequestAdapter as RequestAdapter_2} from 'get-it'
import {RequestOptions} from 'get-it'
import type {Transform} from 'stream'
import type {UrlWithStringQuery} from 'url'

/**
 * Constructs a http.Agent and uses it for all requests.
 * This can be used to override settings such as `maxSockets`, `maxTotalSockets` (to limit concurrency) or change the `timeout`.
 * @public
 */
export declare function agent(opts?: AgentOptions): {
  finalizeOptions: (options: any) => any
}

/** @public */
declare type ApplyMiddleware = <T extends keyof MiddlewareHooks>(
  hook: T,
  value: MiddlewareHooks[T] extends (defaultValue: infer V, ...rest: any[]) => any ? V : never,
  ...args: MiddlewareHooks[T] extends (defaultValue: any, ...rest: infer P) => any ? P : never
) => ReturnType<MiddlewareHooks[T]>

/** @public */
export declare function base(baseUrl: string): {
  processOptions: (options: RequestOptions) => RequestOptions
}

/**
 * The cancel token API is based on the [cancelable promises proposal](https://github.com/tc39/proposal-cancelable-promises), which is currently at Stage 1.
 *
 * Code shamelessly stolen/borrowed from MIT-licensed [axios](https://github.com/mzabriskie/axios). Thanks to [Nick Uraltsev](https://github.com/nickuraltsev), [Matt Zabriskie](https://github.com/mzabriskie) and the other contributors of that project!
 */
/** @public */
export declare class Cancel {
  __CANCEL__: boolean
  message: string | undefined
  constructor(message: string | undefined)
  toString(): string
}

/** @public */
export declare class CancelToken {
  promise: Promise<any>
  reason?: Cancel
  constructor(executor: (cb: (message?: string) => void) => void)
  static source: () => {
    token: CancelToken
    cancel: (message?: string) => void
  }
}

/** @public */
declare function debug_2(opts?: any): {
  processOptions: (options: RequestOptions) => RequestOptions
  onRequest: (event: HookOnRequestEvent) => HookOnRequestEvent
  onResponse: (res: MiddlewareResponse, context: HttpContext) => MiddlewareResponse
  onError: (err: Error | null, context: HttpContext) => Error | null
}
export {debug_2 as debug}

/** @public */
declare interface FinalizeNodeOptionsPayload extends UrlWithStringQuery {
  method: RequestOptions_2['method']
  headers: RequestOptions_2['headers']
  maxRedirects: RequestOptions_2['maxRedirects']
  agent?: any
  cert?: any
  key?: any
  ca?: any
}

/** @public */
export declare function headers(
  _headers: any,
  opts?: any,
): {
  processOptions: (options: RequestOptions) => RequestOptions
}

/** @public */
declare type HookOnRequestEvent_2 = HookOnRequestEventNode | HookOnRequestEventBrowser

/** @public */
declare interface HookOnRequestEventBase {
  options: RequestOptions_2
  context: HttpContext_2
  request: any
}

/** @public */
declare interface HookOnRequestEventBrowser extends HookOnRequestEventBase {
  adapter: Exclude<RequestAdapter, 'node'>
  progress?: undefined
}

/** @public */
declare interface HookOnRequestEventNode extends HookOnRequestEventBase {
  adapter: 'node'
  progress?: any
}

/** @public */
declare interface HttpContext_2 {
  options: RequestOptions_2
  channels: MiddlewareChannels
  applyMiddleware: ApplyMiddleware
}

/** @public */
export declare function httpErrors(): {
  onResponse: (res: MiddlewareResponse, ctx: HttpContext) => MiddlewareResponse
}

/** @public */
export declare function injectResponse(opts?: {
  inject: (
    event: Parameters<MiddlewareHooks['interceptRequest']>[1],
    prevValue: Parameters<MiddlewareHooks['interceptRequest']>[0],
  ) => Partial<MiddlewareResponse_2 | undefined | void>
}): {
  interceptRequest: (
    prevValue: MiddlewareResponse_2 | undefined,
    event: {
      adapter: RequestAdapter_2
      context: HttpContext
    },
  ) => MiddlewareResponse_2 | undefined
}

/** @public */
export declare function jsonRequest(): {
  processOptions: (options: RequestOptions) => RequestOptions
}

/** @public */
export declare function jsonResponse(opts?: any): {
  onResponse: (response: MiddlewareResponse) => MiddlewareResponse
  processOptions: (options: RequestOptions) => RequestOptions & {
    headers: any
  }
}

/** @public */
export declare const keepAlive: (config?: {
  ms?: number
  maxFree?: number
  maxRetries?: number
}) => any

/** @public */
declare interface MiddlewareChannels {
  request: PubSub<HttpContext_2>
  response: PubSub<unknown>
  progress: PubSub<unknown>
  error: PubSub<unknown>
  abort: PubSub<void>
}

/** @public */
declare interface MiddlewareHooks {
  processOptions: (options: RequestOptions_2) => RequestOptions_2
  validateOptions: (options: RequestOptions_2) => void | undefined
  interceptRequest: (
    prevValue: MiddlewareResponse_2 | undefined,
    event: {
      adapter: RequestAdapter
      context: HttpContext_2
    },
  ) => MiddlewareResponse_2 | undefined | void
  finalizeOptions: (
    options: FinalizeNodeOptionsPayload | RequestOptions_2,
  ) => FinalizeNodeOptionsPayload | RequestOptions_2
  onRequest: (evt: HookOnRequestEvent_2) => void
  onResponse: (response: MiddlewareResponse_2, context: HttpContext_2) => MiddlewareResponse_2
  onError: (err: Error | null, context: HttpContext_2) => any
  onReturn: (channels: MiddlewareChannels, context: HttpContext_2) => any
  onHeaders: (
    response: IncomingMessage,
    evt: {
      headers: IncomingHttpHeaders
      adapter: RequestAdapter
      context: HttpContext_2
    },
  ) => ProgressStream
}

/** @public */
declare interface MiddlewareResponse_2 {
  body: any
  url: string
  method: string
  headers: any
  statusCode: number
  statusMessage: string
}

/** @public */
export declare function mtls(config?: any): {
  finalizeOptions: (options: RequestOptions | FinalizeNodeOptionsPayload_2) =>
    | RequestOptions
    | (FinalizeNodeOptionsPayload_2 & {
        cert: any
        key: any
        ca: any
      })
}

/** @public */
export declare function observable(opts?: {implementation?: any}): {
  onReturn: (channels: MiddlewareChannels_2, context: HttpContext) => any
}

/** @public */
export declare const processOptions: (opts: RequestOptions_2) => {
  url: string
  body?: any
  bodySize?: number
  cancelToken?: any
  compress?: boolean
  headers?: any
  maxRedirects?: number
  maxRetries?: number
  retryDelay?: (attemptNumber: number) => number
  method?: string
  proxy?: string | false | null | ProxyOptions_2
  query?: any
  rawBody?: boolean
  shouldRetry?: any
  stream?: boolean
  timeout: any
  tunnel?: boolean
  debug?: any
  requestId?: number
  attemptNumber?: number
  withCredentials?: boolean
  fetch?: boolean | Omit<RequestInit, 'method'>
  useAbortSignal?: boolean
}

declare interface Progress {
  percentage: number
  transferred: number
  length: number
  remaining: number
  eta: number
  runtime: number
  delta: number
  speed: number
}

/** @public */
export declare function progress(): {
  onHeaders: (
    response: IncomingMessage,
    evt: {
      headers: IncomingHttpHeaders
      adapter: RequestAdapter_2
      context: HttpContext
    },
  ) => ProgressStream_2
  onRequest: (evt: HookOnRequestEvent) => void
  onResponse: (res: MiddlewareResponse, evt: HttpContext) => MiddlewareResponse
}

declare interface ProgressStream extends Transform {
  progress(): Progress
}

/** @public */
export declare const promise: {
  (options?: {onlyBody?: boolean; implementation?: PromiseConstructor}): {
    onReturn: (channels: MiddlewareChannels_2, context: HttpContext) => Promise<unknown>
  }
  Cancel: typeof Cancel
  CancelToken: typeof CancelToken
  isCancel: (value: any) => value is Cancel
}

/** @public */
export declare function proxy(_proxy: any): {
  processOptions: (options: RequestOptions) => {
    proxy: any
  } & RequestOptions
}

/**
 * @public
 */
declare interface ProxyOptions {
  host: string
  port: number
  protocol?: 'http:' | 'https:'
  auth?: {
    username?: string
    password?: string
  }
}

/** @public */
declare interface PubSub<Message> {
  publish: (message: Message) => void
  subscribe: (subscriber: Subscriber<Message>) => () => void
}

/**
 * Reports the request adapter in use. `node` is only available if `ExportEnv` is also `node`.
 * When `ExportEnv` is `browser` then the adapter can be either `xhr` or `fetch`.
 * In the future `fetch` will be available in `node` as well.
 * @public
 */
declare type RequestAdapter = 'node' | 'xhr' | 'fetch'

/** @public */
declare interface RequestOptions_2 {
  url: string
  body?: any
  bodySize?: number
  cancelToken?: any
  compress?: boolean
  headers?: any
  maxRedirects?: number
  maxRetries?: number
  retryDelay?: (attemptNumber: number) => number
  method?: string
  proxy?: string | false | null | ProxyOptions
  query?: any
  rawBody?: boolean
  shouldRetry?: any
  stream?: boolean
  timeout?: any
  tunnel?: boolean
  debug?: any
  requestId?: number
  attemptNumber?: number
  withCredentials?: boolean
  /**
   * Enables using the native `fetch` API instead of the default `http` module, and allows setting its options like `cache`
   */
  fetch?: boolean | Omit<RequestInit, 'method'>
  /**
   * Some frameworks have special behavior for `fetch` when an `AbortSignal` is used, and may want to disable it unless userland specifically opts-in.
   */
  useAbortSignal?: boolean
}

/** @public */
export declare const retry: {
  (opts?: Partial<RetryOptions>): {
    onError: (err: Error | null, context: HttpContext) => Error | null
  }
  shouldRetry: (err: any, _num: number, options: any) => boolean
}

/** @public */
declare interface RetryOptions {
  shouldRetry: (err: any, num: number, options: any) => boolean
  maxRetries?: number
  retryDelay?: (attemptNumber: number) => number
}

/** @public */
declare interface Subscriber<Event> {
  (event: Event): void
}

/** @public */
export declare function urlEncoded(): {
  processOptions: (options: RequestOptions) => RequestOptions
}

/** @public */
export declare const validateOptions: (options: RequestOptions) => void

export {}
