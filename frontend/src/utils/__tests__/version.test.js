import { describe, it, expect } from 'vitest'
import { parseVersion, compareVersions } from '../version'

describe('version compare', () => {
  it('parses v-prefixed tags', () => {
    expect(parseVersion('v1.2.0')).toEqual([1, 2, 0])
  })

  it('detects newer releases', () => {
    expect(compareVersions('v1.2.0', '1.1.0')).toBeGreaterThan(0)
    expect(compareVersions('v2.0', 'v1.9.9')).toBeGreaterThan(0)
  })

  it('treats equal versions as no-update', () => {
    expect(compareVersions('v1.2.0', '1.2.0')).toBe(0)
  })

  it('ignores older releases', () => {
    expect(compareVersions('v1.0.0', '1.2.0')).toBeLessThan(0)
  })
})
