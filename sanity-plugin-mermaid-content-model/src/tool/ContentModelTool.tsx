import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useSchema} from 'sanity'
import {Box, Card, Flex, Stack, Text, useRootTheme} from '@sanity/ui'
import {TransformWrapper, TransformComponent, type ReactZoomPanPinchRef} from 'react-zoom-pan-pinch'

import {modelFor, renderDiagram} from '../build-diagram'
import {DARK_THEME, LIGHT_THEME} from '../emit-mermaid'
import {
  defaultSelection,
  elementGroups,
  orphanObjects,
  resolveElements,
  type ElementsSelection,
} from '../elements'
import {MermaidView} from './MermaidView'
import {CopyCodeButton} from './CopyCodeButton'
import {CopyPngButton} from './CopyPngButton'
import {ElementsMenu} from './ElementsMenu'
import {ZoomControls} from './ZoomControls'

// Pan/zoom scale bounds. min low enough to fit very large diagrams; max high
// enough to zoom into detail on a fitted large diagram.
const MIN_SCALE = 1
const MAX_SCALE = 15

/**
 * The top-nav tool. Reads the fully-composed Studio schema via `useSchema()`,
 * walks it once into the unfiltered model, and renders it in a Vision-like
 * full-height layout: a top control bar over a scrollable work area. The
 * Elements menu drives an in-memory selection; each toggle re-resolves and
 * re-renders the diagram live.
 *
 * Deliberately thin — the model, filtering, selection resolution, and rendering
 * are all pure modules (unit-tested without a DOM). This component only wires
 * Studio context (schema, theme) to those pieces, so it's covered by the live
 * eyeball check rather than DOM tests. See docs/ui-design.md.
 */
export function ContentModelTool(): React.JSX.Element {
  const schema = useSchema()
  // Follow Studio's resolved colour scheme: light/dark drives the diagram's
  // palette (classDef colours) and mermaid's base theme (bg/edges/labels).
  const {scheme} = useRootTheme()
  const diagramTheme = scheme === 'dark' ? DARK_THEME : LIGHT_THEME

  const {model, warnings} = useMemo(() => modelFor(schema), [schema])
  const groups = useMemo(() => (model ? elementGroups(model) : null), [model])
  // Schema is stable within a session, so initialise the selection once.
  const [selection, setSelection] = useState<ElementsSelection | null>(() =>
    model ? defaultSelection(model) : null,
  )
  // The currently-rendered SVG, lifted from MermaidView so "Copy PNG" rasterizes
  // exactly what's displayed.
  const [renderedSvg, setRenderedSvg] = useState<string | null>(null)

  // Pan/zoom: fit the diagram to the viewport on first render and on Reset.
  const transformRef = useRef<ReactZoomPanPinchRef>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const hasFitRef = useRef(false)

  const fitView = useCallback(() => {
    const api = transformRef.current
    const viewport = viewportRef.current
    if (!api || !viewport) return
    // Target the *displayed* SVG (not the off-flow measurement container).
    const svg = viewport.querySelector('[data-diagram] svg')
    if (!svg) return
    // zoomToElement measures the element's actual box and scales+centers it to
    // fit the wrapper — no assumptions about the SVG's rendered size. (0 = no
    // animation; the cast bridges SVGElement → the HTMLElement the type expects,
    // both support getBoundingClientRect.)
    api.zoomToElement(svg as HTMLElement, undefined, 0)
  }, [])

  // Fit once when the diagram first renders (a frame later, so the viewport is
  // laid out). Subsequent re-renders (filtering, theme) keep the user's view;
  // Reset re-fits on demand.
  useEffect(() => {
    if (!renderedSvg || hasFitRef.current) return
    hasFitRef.current = true
    const id = requestAnimationFrame(fitView)
    return () => cancelAnimationFrame(id)
  }, [renderedSvg, fitView])

  const resolved = model && selection ? resolveElements(model, selection) : null
  const mermaid =
    model && resolved ? renderDiagram(model, {...resolved, theme: diagramTheme}) : null
  const orphans = model && selection ? orphanObjects(model, selection) : []

  return (
    <Flex direction="column" height="fill">
      <Card paddingX={4} paddingY={3} borderBottom>
        <Flex align="center" justify="space-between" gap={3}>
          <Text size={1} weight="semibold">
            Content Model
          </Text>
          {model && selection && groups && (
            // Controls, floated right: [Copy Code] [Copy PNG] [Elements].
            <Flex gap={2}>
              <CopyCodeButton code={mermaid} />
              <CopyPngButton svg={renderedSvg} />
              <ElementsMenu
                selection={selection}
                groups={groups}
                onChange={setSelection}
                orphans={orphans}
              />
            </Flex>
          )}
        </Flex>
      </Card>

      <Flex direction="column" flex={1} style={{minHeight: 0}}>
        {mermaid === null ? (
          <Box padding={4}>
            <Card tone="caution" padding={4} radius={2} shadow={1}>
              <Stack gap={3}>
                {warnings.map((warning, i) => (
                  <Text key={i} size={1}>
                    {warning}
                  </Text>
                ))}
              </Stack>
            </Card>
          </Box>
        ) : (
          <>
            {warnings.length > 0 && (
              <Box paddingX={4} paddingTop={3}>
                <Card tone="caution" padding={3} radius={2}>
                  <Stack gap={2}>
                    {warnings.map((warning, i) => (
                      <Text key={i} size={1} muted>
                        {warning}
                      </Text>
                    ))}
                  </Stack>
                </Card>
              </Box>
            )}
            {/* Bounded, overflow-hidden viewport: pan/zoom operates within it. */}
            <Box ref={viewportRef} flex={1} style={{position: 'relative', overflow: 'hidden', minHeight: 0}}>
              <TransformWrapper ref={transformRef} minScale={MIN_SCALE} maxScale={MAX_SCALE}>
                {({zoomIn, zoomOut}) => (
                  <>
                    <ZoomControls
                      onZoomIn={() => zoomIn()}
                      onZoomOut={() => zoomOut()}
                      onReset={fitView}
                    />
                    <TransformComponent wrapperStyle={{width: '100%', height: '100%'}}>
                      <MermaidView code={mermaid} colorScheme={scheme} onSvg={setRenderedSvg} />
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </Box>
          </>
        )}
      </Flex>
    </Flex>
  )
}
