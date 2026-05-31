import {describe, it, expect} from 'vitest'
import {probe} from './probe.ts'

describe('probe', () => {
  it('detects Rule.required()', () => {
    const result = probe((Rule: any) => Rule.required())
    expect(result.required).toBe(true)
  })

  it('reports required: false when Rule.required() is not called', () => {
    const result = probe((Rule: any) => Rule.min(1))
    expect(result.required).toBe(false)
  })

  it('captures the numeric argument to Rule.min()', () => {
    const result = probe((Rule: any) => Rule.min(2))
    expect(result.min).toBe(2)
  })

  it('captures the numeric argument to Rule.max()', () => {
    const result = probe((Rule: any) => Rule.max(5))
    expect(result.max).toBe(5)
  })

  it('captures all three across a chained call', () => {
    const result = probe((Rule: any) => Rule.required().min(2).max(5))
    expect(result).toEqual({
      required: true,
      min: 2,
      max: 5,
      hasCustom: false,
      hasOtherConstraints: false,
    })
  })

  it('flags hasCustom: true when Rule.custom() is called', () => {
    const result = probe((Rule: any) => Rule.custom((value: unknown) => !!value))
    expect(result.hasCustom).toBe(true)
  })

  it('flags hasCustom: false when Rule.custom() is not called', () => {
    const result = probe((Rule: any) => Rule.required())
    expect(result.hasCustom).toBe(false)
  })

  it('flags hasOtherConstraints: true for a regex validator', () => {
    const result = probe((Rule: any) => Rule.regex(/^x/))
    expect(result.hasOtherConstraints).toBe(true)
  })

  it('flags hasOtherConstraints: false when only required is called', () => {
    const result = probe((Rule: any) => Rule.required())
    expect(result.hasOtherConstraints).toBe(false)
  })

  it('treats severity calls (warning/error/info) as not-a-constraint', () => {
    const result = probe((Rule: any) => Rule.warning().required())
    expect(result.hasOtherConstraints).toBe(false)
  })

  it('flags hasOtherConstraints: true alongside required when both are present', () => {
    const result = probe((Rule: any) => Rule.required().regex(/^x/))
    expect(result).toEqual({
      required: true,
      hasCustom: false,
      hasOtherConstraints: true,
    })
  })

  it('handles validation that returns an array of rules', () => {
    // Sanity allows `validation: (Rule) => [Rule.required(), Rule.warning().min(1)]`
    // as a way to declare multiple rules at different severity levels. The probe
    // should aggregate every chain into a single ProbeResult.
    const result = probe((Rule: any) => [Rule.required(), Rule.warning().min(1)])
    expect(result.required).toBe(true)
    expect(result.min).toBe(1)
  })

  it('returns safe defaults when validation does nothing', () => {
    const result = probe(() => undefined)
    expect(result).toEqual({
      required: false,
      hasCustom: false,
      hasOtherConstraints: false,
    })
  })

  it('returns safe defaults when validation returns the bare Rule without chaining', () => {
    const result = probe((Rule: any) => Rule)
    expect(result).toEqual({
      required: false,
      hasCustom: false,
      hasOtherConstraints: false,
    })
  })

  it('returns partial results when validation throws mid-chain', () => {
    const result = probe((Rule: any) => {
      Rule.required().min(2)
      throw new Error('boom')
    })
    expect(result.required).toBe(true)
    expect(result.min).toBe(2)
  })
})
