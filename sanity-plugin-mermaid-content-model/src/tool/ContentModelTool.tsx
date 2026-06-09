import {useMemo, useState} from 'react'
import {useSchema} from 'sanity'
import {Box, Card, Flex, Stack, Text} from '@sanity/ui'

import {modelFor, renderDiagram} from '../build-diagram'
import {
  defaultSelection,
  elementGroups,
  resolveElements,
  type ElementsSelection,
} from '../elements'
import {MermaidView} from './MermaidView'
import {CopyCodeButton} from './CopyCodeButton'
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
  const {model, warnings} = useMemo(() => modelFor(schema), [schema])
  const groups = useMemo(() => (model ? elementGroups(model) : null), [model])
  // Schema is stable within a session, so initialise the selection once.
  const [selection, setSelection] = useState<ElementsSelection | null>(() =>
    model ? defaultSelection(model) : null,
  )

  const resolved = model && selection ? resolveElements(model, selection) : null
  const mermaid = model && resolved ? renderDiagram(model, resolved) : null

  return (
    <Flex direction="column" height="fill">
      <Card paddingX={4} paddingY={3} borderBottom>
        <Flex align="center" justify="space-between" gap={3}>
          <Text size={1} weight="semibold">
            Content Model
          </Text>
          {model && selection && groups && (
            // Controls, floated right. [Copy PNG] slots between these in Phase 5.
            <Flex gap={2}>
              <CopyCodeButton code={mermaid} />
              <ElementsMenu selection={selection} groups={groups} onChange={setSelection} />
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
            <MermaidView code={mermaid} />
          </Stack>
        )}
      </Box>
    </Flex>
  )
}
