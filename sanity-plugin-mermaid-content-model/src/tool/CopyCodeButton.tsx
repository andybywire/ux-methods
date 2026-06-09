import {useCallback} from 'react'
import {Button, useToast} from '@sanity/ui'
import {CopyIcon} from '@sanity/icons'

export interface CopyCodeButtonProps {
  /** The Mermaid source to copy; `null` when there is no diagram (button disabled). */
  code: string | null
}

/**
 * Top-bar control that copies the current Mermaid source to the clipboard and
 * confirms with a toast. "Current" matters for later phases: once Elements
 * filtering lands, `code` is the already-filtered diagram, so this keeps
 * copying whatever is on screen with no change here.
 */
export function CopyCodeButton({code}: CopyCodeButtonProps): React.JSX.Element {
  const toast = useToast()

  const handleCopy = useCallback(async () => {
    if (code === null) return
    try {
      await navigator.clipboard.writeText(code)
      toast.push({status: 'success', title: 'Mermaid code copied to clipboard'})
    } catch (err) {
      toast.push({
        status: 'error',
        title: 'Could not copy to clipboard',
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }, [code, toast])

  return (
    <Button
      text="Copy Code"
      icon={CopyIcon}
      mode="ghost"
      fontSize={1}
      disabled={code === null}
      onClick={handleCopy}
    />
  )
}
