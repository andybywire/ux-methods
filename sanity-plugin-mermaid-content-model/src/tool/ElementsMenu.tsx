import {useState} from 'react'
import {Box, Button, Flex, Popover, Stack, Switch, Text, Tooltip, useClickOutsideEvent} from '@sanity/ui'
import {ControlsIcon} from '@sanity/icons'

import type {ElementsSelection, ElementGroups} from '../elements'

// ControlsIcon rotated 90° so its sliders read vertically, fitting this layout.
// @sanity/icons spread props onto their <svg>, so a CSS transform rotates the
// glyph; the Button still sizes it via font-size. Defined at module scope (not
// inline) so it's a stable component, not redefined each render.
function ElementsIcon(): React.JSX.Element {
  return <ControlsIcon style={{transform: 'rotate(90deg)'}} />
}

export interface ElementsMenuProps {
  selection: ElementsSelection
  groups: ElementGroups
  onChange: (next: ElementsSelection) => void
  /**
   * Currently-visible object classes not reachable from any visible document.
   * Computed by the tool (`orphanObjects`); drives the "Hide Orphan Objects"
   * control. Defaults to none (control disabled).
   */
  orphans?: string[]
}

type CategoryKey = keyof ElementsSelection['categories']

/**
 * The Elements control: a top-bar button that reveals a scrollable popover of
 * checkboxes governing which elements the diagram shows. Each toggle calls
 * `onChange` with the next selection; the tool re-resolves and re-renders live.
 *
 * Presentational — it holds only its open/closed state. The selection lives in
 * the tool, and the selection→filter mapping is the pure `resolveElements`.
 */
export function ElementsMenu({
  selection,
  groups,
  onChange,
  orphans = [],
}: ElementsMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null)
  const [popoverElement, setPopoverElement] = useState<HTMLElement | null>(null)

  useClickOutsideEvent(open ? () => setOpen(false) : undefined, () => [
    referenceElement,
    popoverElement,
  ])

  const toggleCategory = (key: CategoryKey) =>
    onChange({
      ...selection,
      categories: {...selection.categories, [key]: !selection.categories[key]},
    })

  const toggleClass = (name: string) =>
    onChange({
      ...selection,
      classes: {...selection.classes, [name]: !(selection.classes[name] ?? true)},
    })

  const setGroupVisibility = (names: string[], visible: boolean) =>
    onChange({
      ...selection,
      classes: {...selection.classes, ...Object.fromEntries(names.map((n) => [n, visible]))},
    })

  const content = (
    <Box ref={setPopoverElement} overflow="auto" padding={3} style={{maxHeight: '70vh'}}>
      <Stack gap={4}>
        <Stack gap={3}>
          <SectionHeading label="Global Settings" />
          <CheckRow
            label="Inline objects"
            checked={selection.categories.inlineObjects}
            onToggle={() => toggleCategory('inlineObjects')}
          />
          <CheckRow
            label="Attributes"
            checked={selection.categories.attributes}
            onToggle={() => toggleCategory('attributes')}
          />
          <CheckRow
            label="Portable Text Blocks"
            checked={selection.categories.portableText}
            onToggle={() => toggleCategory('portableText')}
          />
        </Stack>

        {groups.documents.length > 0 && (
          <Stack gap={3}>
            <GroupHeader label="Documents" names={groups.documents} onSetAll={setGroupVisibility} />
            {groups.documents.map((name) => (
              <CheckRow
                key={name}
                label={name}
                checked={selection.classes[name] ?? true}
                onToggle={() => toggleClass(name)}
              />
            ))}
          </Stack>
        )}

        {groups.objects.length > 0 && (
          <Stack gap={3}>
            <GroupHeader label="Objects" names={groups.objects} onSetAll={setGroupVisibility} />
            <HideOrphansButton orphans={orphans} onHide={() => setGroupVisibility(orphans, false)} />
            {groups.objects.map((name) => (
              <CheckRow
                key={name}
                label={name}
                checked={selection.classes[name] ?? true}
                onToggle={() => toggleClass(name)}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  )

  return (
    <Popover open={open} content={content} placement="bottom-end" portal constrainSize>
      <Button
        ref={setReferenceElement}
        text="Elements"
        icon={ElementsIcon}
        mode="ghost"
        fontSize={1}
        selected={open}
        onClick={() => setOpen((o) => !o)}
      />
    </Popover>
  )
}

/**
 * The shared section subheading style, used by every section: "Global Settings"
 * uses it alone; `GroupHeader` (Documents / Objects) composes it with the
 * "show all | hide all" links.
 */
function SectionHeading({label}: {label: string}): React.JSX.Element {
  return (
    <Text size={1} weight="semibold" muted>
      {label}
    </Text>
  )
}

function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}): React.JSX.Element {
  return (
    <Flex as="label" align="center" gap={2}>
      <Switch checked={checked} onChange={onToggle} />
      <Text size={1}>{label}</Text>
    </Flex>
  )
}

/**
 * A group subheading (Documents / Objects) with bulk "show all | hide all"
 * text links floated right. The links carry an aria-label (e.g. "show all
 * documents") so they're individually addressable while the visible text stays
 * the plain "show all" / "hide all" Andy asked for.
 */
function GroupHeader({
  label,
  names,
  onSetAll,
}: {
  label: string
  names: string[]
  onSetAll: (names: string[], visible: boolean) => void
}): React.JSX.Element {
  const lower = label.toLowerCase()
  return (
    <Flex align="center" justify="space-between" gap={4}>
      <SectionHeading label={label} />
      <Flex align="center" gap={1}>
        <Button
          mode="bleed"
          text="show all"
          fontSize={0}
          padding={1}
          aria-label={`show all ${lower}`}
          onClick={() => onSetAll(names, true)}
        />
        <Text size={0} muted>
          |
        </Text>
        <Button
          mode="bleed"
          text="hide all"
          fontSize={0}
          padding={1}
          aria-label={`hide all ${lower}`}
          onClick={() => onSetAll(names, false)}
        />
      </Flex>
    </Flex>
  )
}

/**
 * One-shot control that hides every "orphan" object (an object not reachable
 * from any visible document) by flipping its switch off — so the user sees the
 * action and can re-show any they still want. Disabled, with an explanatory
 * tooltip, when there are no visible orphans. The disabled button is wrapped in
 * a Box so the tooltip still receives hover (disabled buttons don't emit it).
 */
function HideOrphansButton({
  orphans,
  onHide,
}: {
  orphans: string[]
  onHide: () => void
}): React.JSX.Element {
  const disabled = orphans.length === 0
  const button = (
    <Button
      mode="ghost"
      text="Hide Orphan Objects"
      fontSize={1}
      padding={2}
      width='fill'
      disabled={disabled}
      onClick={onHide}
    />
  )
  if (!disabled) return button
  return (
    <Tooltip
      content={
        <Box padding={2}>
          <Text size={1}>No orphan objects visible</Text>
        </Box>
      }
      placement="left"
      delay={500}
      portal
    >
      <Box>{button}</Box>
    </Tooltip>
  )
}
