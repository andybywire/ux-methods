import {describe, it, expect, vi, afterEach} from 'vitest'
import {screen, fireEvent, cleanup} from '@testing-library/react'

import {renderWithUi} from '../test/renderWithUi'
import {ZoomControls} from './ZoomControls'

afterEach(() => cleanup())

describe('ZoomControls', () => {
  it('calls the matching handler for each control', () => {
    const onZoomIn = vi.fn()
    const onZoomOut = vi.fn()
    const onReset = vi.fn()
    renderWithUi(<ZoomControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} onReset={onReset} />)

    fireEvent.click(screen.getByRole('button', {name: /zoom in/i}))
    fireEvent.click(screen.getByRole('button', {name: /zoom out/i}))
    fireEvent.click(screen.getByRole('button', {name: /reset view/i}))

    expect(onZoomIn).toHaveBeenCalledTimes(1)
    expect(onZoomOut).toHaveBeenCalledTimes(1)
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
