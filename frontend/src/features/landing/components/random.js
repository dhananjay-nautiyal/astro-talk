// Deterministic PRNG for stable procedural geometry (starfields, particles).
// Unlike Math.random(), a seeded generator is pure: same seed renders the
// same scene on every mount, which keeps visuals stable and lint-clean.

export function mulberry32(seed) {
  let state = seed >>> 0
  return function next() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
