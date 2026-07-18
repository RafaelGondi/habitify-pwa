/** Discrete completion levels mapped to Akoma's 5 chromatic accent shades. */
export type CompletionShade =
  | 'none'
  | 'lighter'
  | 'light'
  | 'base'
  | 'dark'
  | 'darker'

/** Maps 0–1 completion rate to a shade step (GitHub-style: more done → deeper). */
export function completionShade(rate: number): CompletionShade {
  if (!Number.isFinite(rate) || rate <= 0) return 'none'
  if (rate < 0.25) return 'lighter'
  if (rate < 0.5) return 'light'
  if (rate < 0.75) return 'base'
  if (rate < 1) return 'dark'
  return 'darker'
}

export function completionShadeClass(shade: CompletionShade): string {
  return `completion-shade--${shade}`
}

/** Whether text/icons on the shade need contrast (light-on-dark). */
export function completionShadeNeedsContrast(shade: CompletionShade): boolean {
  return shade === 'base' || shade === 'dark' || shade === 'darker'
}
