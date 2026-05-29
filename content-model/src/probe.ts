// Probe a Sanity `validation` function to discover which Rule methods were
// called and with what arguments. The probe never imports Sanity's actual
// Rule class — it passes a Proxy that records every method invocation in the
// chain. See ../../docs/decisions/0006-content-model-mermaid-export.md for
// the broader rationale (cardinality precision, custom-validator marker).

export interface ProbeResult {
  required: boolean
  /** Argument to the most recent `Rule.min(n)` call, if any. */
  min?: number
  /** Argument to the most recent `Rule.max(n)` call, if any. */
  max?: number
  /** True when the chain contains at least one `Rule.custom(fn)` call. */
  hasCustom: boolean
  /**
   * True when the chain contains a constraint method beyond required/min/max/custom —
   * e.g. regex, email, uri, unique, integer, positive, length, precision, etc.
   * The walker uses this together with `hasCustom` to decide whether to surface a
   * "this field has validation the diagram can't fully show" marker.
   */
  hasOtherConstraints: boolean
}

// Methods that are NOT real constraints — explicitly modelled by the probe
// (required/min/max/custom), or severity modifiers, or helpers. Anything else
// called on the Rule chain counts as an "other constraint".
const NON_CONSTRAINT_METHODS = new Set([
  // explicitly modelled elsewhere on ProbeResult
  'required',
  'min',
  'max',
  'custom',
  // severity modifiers — they don't add constraints, they change reporting level
  'warning',
  'error',
  'info',
  // helpers
  'optional',
  'valueOfField',
])

// Build a Proxy that records every method invocation in a Rule chain. The
// proxy returns itself from every call so chaining works (Rule.required().min(1)
// records both calls). It also handles the Sanity convention that validation
// can return either a single Rule or an array of Rules — the array case is
// just multiple chains, all from the same probe instance.
function createProbeRule(calls: Array<{method: string; args: unknown[]}>) {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      // Symbol access (e.g. Symbol.toPrimitive, Symbol.iterator) — return
      // undefined so JS treats the proxy as an ordinary object. Without this,
      // serializing or comparing the proxy can record spurious calls.
      if (typeof prop !== 'string') return undefined
      return (...args: unknown[]) => {
        calls.push({method: prop, args})
        return proxy
      }
    },
  }
  const proxy: object = new Proxy({}, handler)
  return proxy
}

export function probe(validation: (Rule: unknown) => unknown): ProbeResult {
  const calls: Array<{method: string; args: unknown[]}> = []
  const rule = createProbeRule(calls)
  try {
    validation(rule)
  } catch {
    // Validation functions sometimes contain logic that throws when called
    // with a probe instead of a real Rule (e.g. they inspect `value` or
    // call helpers that assume a real schema context). Keep whatever
    // method calls were recorded before the throw — partial information
    // is better than no information, and the throw itself is not
    // diagnostic of the field's constraints.
  }

  const result: ProbeResult = {
    required: calls.some((c) => c.method === 'required'),
    hasCustom: calls.some((c) => c.method === 'custom'),
    hasOtherConstraints: calls.some((c) => !NON_CONSTRAINT_METHODS.has(c.method)),
  }

  // Sanity allows chained calls to override earlier ones (e.g.
  // `Rule.min(2).min(3)` ends up with min=3). Find the most recent call and
  // use its first argument when it's a number.
  const lastMin = lastCallArg(calls, 'min')
  if (typeof lastMin === 'number') result.min = lastMin

  const lastMax = lastCallArg(calls, 'max')
  if (typeof lastMax === 'number') result.max = lastMax

  return result
}

function lastCallArg(
  calls: Array<{method: string; args: unknown[]}>,
  method: string,
): unknown {
  for (let i = calls.length - 1; i >= 0; i--) {
    if (calls[i]?.method === method) return calls[i]?.args[0]
  }
  return undefined
}
