import {describe, it, expect, vi, afterEach} from 'vitest'
import {screen, fireEvent, cleanup} from '@testing-library/react'

import {renderWithUi} from '../test/renderWithUi'
import {ElementsMenu} from './ElementsMenu'
import type {ElementsSelection, ElementGroups} from '../elements'

afterEach(() => cleanup())

const groups: ElementGroups = {documents: ['Method', 'Discipline'], objects: ['HeroImage']}

function selection(): ElementsSelection {
  return {
    categories: {inlineObjects: true, portableText: true, attributes: true},
    classes: {Method: true, Discipline: true, HeroImage: true},
  }
}

describe('ElementsMenu', () => {
  it('renders the Elements button, with the menu closed initially', () => {
    renderWithUi(<ElementsMenu selection={selection()} groups={groups} onChange={vi.fn()} />)
    expect(screen.getByRole('button', {name: /elements/i})).toBeInTheDocument()
    expect(screen.queryByText('Inline objects')).not.toBeInTheDocument()
  })

  it('opens the menu on click, listing categories and grouped classes', () => {
    renderWithUi(<ElementsMenu selection={selection()} groups={groups} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', {name: /elements/i}))
    expect(screen.getByText('Inline objects')).toBeInTheDocument()
    expect(screen.getByText('Attributes')).toBeInTheDocument()
    expect(screen.getByText('Portable Text Blocks')).toBeInTheDocument()
    expect(screen.getByText('Method')).toBeInTheDocument()
    expect(screen.getByText('HeroImage')).toBeInTheDocument()
  })

  it('toggles a category off via onChange when its checkbox is clicked', () => {
    const onChange = vi.fn()
    renderWithUi(<ElementsMenu selection={selection()} groups={groups} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', {name: /elements/i}))
    fireEvent.click(screen.getByRole('checkbox', {name: /portable text blocks/i}))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0]?.[0].categories.portableText).toBe(false)
  })

  it('toggles a per-class checkbox off via onChange', () => {
    const onChange = vi.fn()
    renderWithUi(<ElementsMenu selection={selection()} groups={groups} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', {name: /elements/i}))
    fireEvent.click(screen.getByRole('checkbox', {name: /^method$/i}))
    expect(onChange.mock.calls[0]?.[0].classes.Method).toBe(false)
  })

  it('"hide all" under Documents hides every document in the group', () => {
    const onChange = vi.fn()
    renderWithUi(<ElementsMenu selection={selection()} groups={groups} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', {name: /elements/i}))
    fireEvent.click(screen.getByRole('button', {name: /hide all documents/i}))
    const next = onChange.mock.calls[0]?.[0]
    expect(next.classes.Method).toBe(false)
    expect(next.classes.Discipline).toBe(false)
    // Objects in the other group are untouched.
    expect(next.classes.HeroImage).toBe(true)
  })

  it('"show all" under Objects re-shows every object in the group', () => {
    const onChange = vi.fn()
    const sel = selection()
    sel.classes.HeroImage = false
    renderWithUi(<ElementsMenu selection={sel} groups={groups} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', {name: /elements/i}))
    fireEvent.click(screen.getByRole('button', {name: /show all objects/i}))
    expect(onChange.mock.calls[0]?.[0].classes.HeroImage).toBe(true)
  })
})
