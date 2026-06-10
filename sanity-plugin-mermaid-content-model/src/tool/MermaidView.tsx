import {useEffect, useId, useRef, useState} from 'react'
import mermaid from 'mermaid'

// Mermaid is initialised inside the render effect (not at module load) so its
// base theme can follow Studio's colour scheme: light vs dark drives the
// background, edges, and label colours. The document/object box colours come
// separately from the `classDef` lines the emitter writes (see DiagramTheme),
// already baked into `code`.

// Off-flow container that mermaid.render() uses for text measurement. Without
// it, mermaid appends a temporary node to document.body on every render, which
// briefly grows the page and flickers the *window* scrollbar (shifting the
// whole Studio a few px on each Elements toggle). `position: fixed` + zero size
// keeps it out of document flow; `opacity: 0` (not display:none/visibility) so
// the SVG text is still laid out and measurable.
const MEASURE_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  overflow: 'hidden',
  opacity: 0,
  pointerEvents: 'none',
}

export interface MermaidViewProps {
  /** Mermaid `classDiagram` source to render. */
  code: string
  /**
   * Studio colour scheme — selects mermaid's named base theme (`default`/`dark`)
   * for background, edges, and labels. Box colours come from the `classDef`
   * lines already in `code`. Default 'light'.
   */
  colorScheme?: 'light' | 'dark'
}

/**
 * Render a Mermaid diagram string to inline SVG. Browser-only (mermaid needs a
 * DOM); kept deliberately thin so it can be unit-tested with mermaid mocked.
 * The injected SVG is also the source for the future "Copy PNG" feature, so it
 * stays self-contained.
 */
export function MermaidView({code, colorScheme = 'light'}: MermaidViewProps): React.JSX.Element {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // mermaid.render needs a unique, selector-safe id; useId() includes colons.
  const renderId = `mcm-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const measureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    // Re-initialise per render so the base theme tracks the current colour
    // scheme (cheap; it's just config). `startOnLoad: false` — we render imperatively.
    mermaid.initialize({startOnLoad: false, theme: colorScheme === 'dark' ? 'dark' : 'default'})
    mermaid
      .render(renderId, code, measureRef.current ?? undefined)
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
  }, [code, renderId, colorScheme])

  return (
    <>
      <div ref={measureRef} aria-hidden="true" style={MEASURE_STYLE} />
      {error ? (
        <div role="alert" style={{whiteSpace: 'pre-wrap', fontFamily: 'monospace'}}>
          Failed to render diagram:{'\n'}
          {error}
        </div>
      ) : svg === null ? (
        <div>Rendering diagram…</div>
      ) : (
        // mermaid output is self-contained, sanitised SVG (securityLevel defaults
        // to 'strict'); injecting it directly is how every Mermaid React wrapper works.
        <div dangerouslySetInnerHTML={{__html: svg}} />
      )}
    </>
  )
}
