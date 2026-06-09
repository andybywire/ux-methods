import {useSchema} from 'sanity'
import {Box, Card, Flex, Stack, Text} from '@sanity/ui'

import {buildDiagram} from '../build-diagram'
import {MermaidView} from './MermaidView'
import {CopyCodeButton} from './CopyCodeButton'

/**
 * The top-nav tool. Reads the fully-composed Studio schema via `useSchema()`,
 * builds the Mermaid diagram, and renders it in a Vision-like full-height
 * layout: a top control bar (controls land in later phases) over a scrollable
 * work area.
 *
 * Deliberately thin — all diagram logic lives in `buildDiagram` (pure, fully
 * unit-tested) and the rendering in `MermaidView`. This component only wires
 * Studio context (schema, theme) to those pieces, so it's covered by the live
 * eyeball check rather than DOM tests. See docs/ui-design.md.
 */
export function ContentModelTool(): React.JSX.Element {
  const schema = useSchema()
  const {mermaid, warnings} = buildDiagram(schema)

  return (
    <Flex direction="column" height="fill">
      <Card paddingX={4} paddingY={3} borderBottom>
        <Flex align="center" justify="space-between">
          <Text size={1} weight="semibold">
            Content Model
          </Text>
          {/* Controls. [Copy PNG] and [Elements] join here in later phases. */}
          <Flex gap={2}>
            <CopyCodeButton code={mermaid} />
          </Flex>
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
