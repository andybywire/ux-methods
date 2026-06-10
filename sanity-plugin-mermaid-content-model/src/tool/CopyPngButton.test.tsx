import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest'
import {screen, fireEvent, waitFor, cleanup} from '@testing-library/react'

import {renderWithUi} from '../test/renderWithUi'

// svgToPngBlob is browser-only (canvas); mock it so we can test the wiring.
const {pngBlobMock} = vi.hoisted(() => ({pngBlobMock: vi.fn()}))
vi.mock('./svg-to-png', () => ({svgToPngBlob: pngBlobMock}))

import {CopyPngButton} from './CopyPngButton'

const writeMock = vi.fn()

beforeEach(() => {
  pngBlobMock.mockReset().mockResolvedValue(new Blob([], {type: 'image/png'}))
  writeMock.mockReset().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {write: writeMock}})
  // jsdom has no ClipboardItem; stub a minimal one.
  vi.stubGlobal(
    'ClipboardItem',
    class {
      constructor(public items: Record<string, Blob>) {}
    },
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('CopyPngButton', () => {
  it('is disabled when there is no diagram to copy', () => {
    renderWithUi(<CopyPngButton svg={null} />)
    expect(screen.getByRole('button', {name: /copy png/i})).toBeDisabled()
  })

  it('converts the SVG and writes a PNG to the clipboard on click', async () => {
    renderWithUi(<CopyPngButton svg="<svg/>" />)
    fireEvent.click(screen.getByRole('button', {name: /copy png/i}))
    await waitFor(() => {
      expect(pngBlobMock).toHaveBeenCalledWith('<svg/>')
      expect(writeMock).toHaveBeenCalledTimes(1)
    })
  })

  it('shows a success toast after copying', async () => {
    renderWithUi(<CopyPngButton svg="<svg/>" />)
    fireEvent.click(screen.getByRole('button', {name: /copy png/i}))
    expect(await screen.findByText(/copied/i)).toBeInTheDocument()
  })

  it('surfaces an error toast when conversion or clipboard write fails', async () => {
    pngBlobMock.mockRejectedValue(new Error('canvas blew up'))
    renderWithUi(<CopyPngButton svg="<svg/>" />)
    fireEvent.click(screen.getByRole('button', {name: /copy png/i}))
    expect(await screen.findByText(/could not copy png/i)).toBeInTheDocument()
  })
})
