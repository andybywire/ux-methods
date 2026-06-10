import {useCallback} from 'react'
import {Button, useToast} from '@sanity/ui'
import {ClipboardImageIcon} from '@sanity/icons'

import {svgToPngBlob} from './svg-to-png'

export interface CopyPngButtonProps {
  /** The currently-rendered diagram SVG; `null` when there's nothing to copy (button disabled). */
  svg: string | null
}

/**
 * Top-bar control that copies a PNG of the current diagram to the clipboard:
 * the rendered SVG → canvas → PNG blob → image clipboard, with a toast. Copies
 * whatever is on screen (already Elements-filtered). Browser-only work lives in
 * `svgToPngBlob`; this component is the thin click → convert → clipboard wiring.
 */
export function CopyPngButton({svg}: CopyPngButtonProps): React.JSX.Element {
  const toast = useToast()

  const handleCopy = useCallback(async () => {
    if (svg === null) return
    try {
      const blob = await svgToPngBlob(svg)
      await navigator.clipboard.write([new ClipboardItem({'image/png': blob})])
      toast.push({status: 'success', title: 'Diagram PNG copied to clipboard'})
    } catch (err) {
      toast.push({
        status: 'error',
        title: 'Could not copy PNG',
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }, [svg, toast])

  return (
    <Button
      text="Copy PNG"
      icon={ClipboardImageIcon}
      mode="ghost"
      fontSize={1}
      disabled={svg === null}
      onClick={handleCopy}
    />
  )
}
