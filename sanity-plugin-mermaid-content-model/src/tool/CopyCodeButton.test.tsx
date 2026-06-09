import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest'
import {screen, fireEvent, waitFor, cleanup} from '@testing-library/react'

import {renderWithUi} from '../test/renderWithUi'
import {CopyCodeButton} from './CopyCodeButton'

// jsdom has no clipboard; install a mock writeText spy before each test.
const writeText = vi.fn()
beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText}})
})
afterEach(() => cleanup())

describe('CopyCodeButton', () => {
  it('writes the diagram code to the clipboard on click', async () => {
    const code = 'classDiagram\n  class Method'
    renderWithUi(<CopyCodeButton code={code} />)
    fireEvent.click(screen.getByRole('button', {name: /copy code/i}))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(code))
  })

  it('shows a success toast after copying', async () => {
    renderWithUi(<CopyCodeButton code="classDiagram" />)
    fireEvent.click(screen.getByRole('button', {name: /copy code/i}))
    expect(await screen.findByText(/copied/i)).toBeInTheDocument()
  })

  it('is disabled when there is no diagram to copy', () => {
    renderWithUi(<CopyCodeButton code={null} />)
    expect(screen.getByRole('button', {name: /copy code/i})).toBeDisabled()
  })

  it('surfaces an error toast when the clipboard write fails', async () => {
    writeText.mockRejectedValue(new Error('denied'))
    renderWithUi(<CopyCodeButton code="classDiagram" />)
    fireEvent.click(screen.getByRole('button', {name: /copy code/i}))
    expect(await screen.findByText(/could not copy/i)).toBeInTheDocument()
  })
})
