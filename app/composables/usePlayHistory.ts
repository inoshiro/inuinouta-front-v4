import type { PlayEvent, Song } from '~/types'

const EVENTS_KEY = 'play-history:events'
const SONGS_KEY = 'play-history:songs'
const MAX_EVENTS = 200
const RETENTION_DAYS = 30
const DECAY_HALF_LIFE_DAYS = 7
/** Minimum qualified plays required for a song to appear in results. */
const MIN_PLAY_COUNT = 2
/** Number of top-scored candidates to pick from randomly. */
const TOP_CANDIDATES = 15
/** Number of songs to show in the section. */
const DISPLAY_COUNT = 5

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore quota / private mode errors
  }
}

function pruneEvents(events: PlayEvent[]): PlayEvent[] {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000
  const recent = events.filter((e) => e.playedAt >= cutoff)
  if (recent.length <= MAX_EVENTS) return recent
  return recent.sort((a, b) => b.playedAt - a.playedAt).slice(0, MAX_EVENTS)
}

function shufflePick<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

export function usePlayHistory() {
  /**
   * Record a qualified play for the given song.
   * Also caches the Song object to avoid API fetches in getFrequentlyPlayed().
   */
  function recordPlay(song: Song): void {
    const events = pruneEvents(loadJson<PlayEvent[]>(EVENTS_KEY, []))
    events.push({ songId: song.id, playedAt: Date.now() })
    saveJson(EVENTS_KEY, events)

    const cache = loadJson<Record<number, Song>>(SONGS_KEY, {})
    cache[song.id] = song
    saveJson(SONGS_KEY, cache)
  }

  /**
   * Returns up to DISPLAY_COUNT songs to show in the "最近よく聞く曲" section.
   * Scores each song using exponential time-decay so recently played songs
   * are weighted higher. Picks randomly from the top candidates so the
   * section looks different on each visit.
   */
  function getFrequentlyPlayed(): Song[] {
    const events = pruneEvents(loadJson<PlayEvent[]>(EVENTS_KEY, []))
    if (events.length === 0) return []

    const now = Date.now()

    // Accumulate decay-weighted sum and raw count per song
    const scoreMap = new Map<number, { weightSum: number; count: number }>()
    for (const e of events) {
      const daysAgo = (now - e.playedAt) / (1000 * 60 * 60 * 24)
      const weight = Math.exp(-daysAgo / DECAY_HALF_LIFE_DAYS)
      const entry = scoreMap.get(e.songId) ?? { weightSum: 0, count: 0 }
      scoreMap.set(e.songId, { weightSum: entry.weightSum + weight, count: entry.count + 1 })
    }

    // score = log2(1 + count) × avgWeight
    // This dampens the advantage of high repeat counts so that recently played
    // songs outrank songs that were only played heavily in the distant past.
    const calcScore = (v: { weightSum: number; count: number }) =>
      Math.log2(1 + v.count) * (v.weightSum / v.count)

    // Filter by minimum raw play count, then rank by score
    const candidates = [...scoreMap.entries()]
      .filter(([, v]) => v.count >= MIN_PLAY_COUNT)
      .sort(([, a], [, b]) => calcScore(b) - calcScore(a))
      .slice(0, TOP_CANDIDATES)
      .map(([songId]) => songId)

    if (candidates.length === 0) return []

    const picked = shufflePick(candidates, DISPLAY_COUNT)
    const cache = loadJson<Record<number, Song>>(SONGS_KEY, {})
    return picked.map((id) => cache[id]).filter((s): s is Song => Boolean(s))
  }

  return { recordPlay, getFrequentlyPlayed }
}
