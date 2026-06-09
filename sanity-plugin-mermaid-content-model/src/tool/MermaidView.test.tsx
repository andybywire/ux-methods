import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest'
import {render, screen, cleanup} from '@testing-library/react'

// mermaid is browser-only (real SVG layout); mock it. vi.hoisted lets the
// mock factory reference our spy despite vi.mock being hoisted above imports.
const {renderMock, initializeMock} = vi.hoisted(() => ({
  renderMock: vi.fn(),
  initializeMock: vi.fn(),
}))
vi.mock('mermaid', () => ({
  default: {initialize: initializeMock, render: renderMock},
}))

import {MermaidView} from './MermaidView'

describe('MermaidView', () => {
  beforeEach(() => {
    renderMock.mockReset()
  })
  afterEach(() => cleanup())

  it('injects the SVG returned by mermaid.render', async () => {
    renderMock.mockResolvedValue({svg: '<svg data-testid="diagram">ok</svg>'})
    render(<MermaidView code="classDiagram" />)
    expect(await screen.findByTestId('diagram')).toBeInTheDocument()
  })

  it('passes the diagram code through to mermaid.render', async () => {
    renderMock.mockResolvedValue({svg: '<svg data-testid="diagram" />'})
    render(<MermaidView code={'classDiagram\n  class Method'} />)
    await screen.findByTestId('diagram')
    expect(renderMock).toHaveBeenCalledTimes(1)
    // mermaid.render(id, code) — assert the code argument carries our source.
    expect(renderMock.mock.calls[0]?.[1]).toContain('class Method')
  })

  it('shows an error state (role=alert) when mermaid.render rejects', async () => {
    renderMock.mockRejectedValue(new Error('Parse error on line 2'))
    render(<MermaidView code="not valid" />)
    expect(await screen.findByRole('alert')).toHaveTextContent(/parse error/i)
  })

  it('passes an off-flow container element to mermaid.render (avoids window-scrollbar reflow)', async () => {
    renderMock.mockResolvedValue({svg: '<svg data-testid="diagram" />'})
    render(<MermaidView code="classDiagram" />)
    await screen.findByTestId('diagram')
    // 3rd arg is the measurement container; without it mermaid appends a temp
    // node to document.body and flickers the page scrollbar on every render.
    expect(renderMock.mock.calls[0]?.[2]).toBeInstanceOf(HTMLElement)
  })
})
