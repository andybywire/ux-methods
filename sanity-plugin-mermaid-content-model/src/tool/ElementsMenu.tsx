import {useState} from 'react'
import {Box, Button, Checkbox, Flex, Popover, Stack, Text, useClickOutsideEvent} from '@sanity/ui'
import {ControlsIcon} from '@sanity/icons'

import type {ElementsSelection, ElementGroups} from '../elements'

export interface ElementsMenuProps {
  selection: ElementsSelection
  groups: ElementGroups
  onChange: (next: ElementsSelection) => void
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
export function ElementsMenu({selection, groups, onChange}: ElementsMenuProps): React.JSX.Element {
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
        icon={ControlsIcon}
        mode="ghost"
        fontSize={1}
        selected={open}
        onClick={() => setOpen((o) => !o)}
      />
    </Popover>
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
      <Checkbox checked={checked} onChange={onToggle} />
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
      <Text size={1} weight="semibold" muted>
        {label}
      </Text>
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
