import {useMemo, useState} from 'react'
import {useSchema} from 'sanity'
import {Box, Card, Flex, Stack, Text, useRootTheme} from '@sanity/ui'

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

      <Box flex={1} overflow="auto" padding={4}>
        {mermaid === null ? (
          <Card tone="caution" padding={4} radius={2} shadow={1}>
            <Stack gap={3}>
              {warnings.map((warning, i) => (
                <Text key={i} size={1}>
                  {warning}
                </Text>
              ))}
            </Stack>
          </Card>
        ) : (
          <Stack gap={4}>
            {warnings.length > 0 && (
              <Card tone="caution" padding={3} radius={2}>
                <Stack gap={2}>
                  {warnings.map((warning, i) => (
                    <Text key={i} size={1} muted>
                      {warning}
                    </Text>
                  ))}
                </Stack>
              </Card>
            )}
            <MermaidView code={mermaid} colorScheme={scheme} onSvg={setRenderedSvg} />
          </Stack>
        )}
      </Box>
    </Flex>
  )
}
