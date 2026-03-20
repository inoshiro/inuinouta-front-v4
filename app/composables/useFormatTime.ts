export function useFormatTime() {
  /** Format seconds to mm:ss */
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  /** Calculate song duration from start_at and end_at (both in seconds) */
  function songDuration(startAt: number, endAt: number): string {
    if (endAt <= startAt) return '0:00'
    return formatTime(endAt - startAt)
  }

  return { formatTime, songDuration }
}
