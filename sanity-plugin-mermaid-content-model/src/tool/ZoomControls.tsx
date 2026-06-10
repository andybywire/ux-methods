import {Button, Card, Flex} from '@sanity/ui'
import {AddIcon, RemoveIcon, ResetIcon} from '@sanity/icons'

export interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

/**
 * Floating zoom controls overlaid on the diagram viewport (bottom-right). Thin
 * — the actual pan/zoom is react-zoom-pan-pinch; these buttons just call the
 * utilities it hands the tool. Wheel/trackpad zoom and drag-pan work without
 * them; the buttons (and Reset) are for discoverability and non-trackpad use.
 */
export function ZoomControls({onZoomIn, onZoomOut, onReset}: ZoomControlsProps): React.JSX.Element {
  return (
    <Card
      radius={2}
      shadow={1}
      padding={1}
      style={{position: 'absolute', right: 12, bottom: 12, zIndex: 1}}
    >
      <Flex gap={1}>
        <Button mode="bleed" icon={RemoveIcon} aria-label="Zoom out" onClick={onZoomOut} />
        <Button mode="bleed" icon={ResetIcon} aria-label="Reset view" onClick={onReset} />
        <Button mode="bleed" icon={AddIcon} aria-label="Zoom in" onClick={onZoomIn} />
      </Flex>
    </Card>
  )
}
