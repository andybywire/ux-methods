import {useEffect, useId, useState} from 'react'
import mermaid from 'mermaid'

// Initialise once per module load. startOnLoad:false because we render
// imperatively via mermaid.render(); theme is left at the default for now —
// document/object colours come from the `classDef` lines the emitter writes.
// Studio light/dark theming is a later phase (see docs/ui-design.md).
mermaid.initialize({startOnLoad: false})

export interface MermaidViewProps {
  /** Mermaid `classDiagram` source to render. */
  code: string
}

/**
 * Render a Mermaid diagram string to inline SVG. Browser-only (mermaid needs a
 * DOM); kept deliberately thin so it can be unit-tested with mermaid mocked.
 * The injected SVG is also the source for the future "Copy PNG" feature, so it
 * stays self-contained.
 */
export function MermaidView({code}: MermaidViewProps): React.JSX.Element {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // mermaid.render needs a unique, selector-safe id; useId() includes colons.
  const renderId = `mcm-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  useEffect(() => {
    let cancelled = false
    mermaid
      .render(renderId, code)
      .then(({svg: rendered}) => {
        if (cancelled) return
        setSvg(rendered)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
        setSvg(null)
      })
    return () => {
      cancelled = true
    }
  }, [code, renderId])

  if (error) {
    return (
      <div role="alert" style={{whiteSpace: 'pre-wrap', fontFamily: 'monospace'}}>
        Failed to render diagram:{'\n'}
        {error}
      </div>
    )
  }
  if (svg === null) {
    return <div>Rendering diagram…</div>
  }
  // mermaid output is self-contained, sanitised SVG (securityLevel defaults to
  // 'strict'); injecting it directly is how every Mermaid React wrapper works.
  return <div dangerouslySetInnerHTML={{__html: svg}} />
}
