export type BattleLogValidationResult = {
  isValid: boolean
  score: number
  errors: string[]
  warnings: string[]
}

const REQUIRED_PATTERNS = [
  {
    label: 'Vorbereitungsabschnitt',
    pattern: /(^|\n)Vorbereitung(\n|$)/i,
    message: 'Der Kampflog muss einen Abschnitt "Vorbereitung" enthalten.',
  },
  {
    label: 'Mindestens ein Zug',
    pattern: /(^|\n)Zug von .+/i,
    message: 'Der Kampflog muss mindestens einen Abschnitt "Zug von ..." enthalten.',
  },
]

const RESULT_PATTERNS = [
  /hat gewonnen\./i,
  /gegner hat aufgegeben/i,
  /du hast aufgegeben/i,
  /hat aufgegeben/i,
]

const STRONG_HINT_PATTERNS = [
  /Münzwurf/i,
  /Starthand/i,
  /Aktive Position/i,
  /hat eine Karte gezogen/i,
  /hat .* gezogen/i,
  /hat .* gespielt/i,
  /hat den eigenen Zug beendet/i,
  /Schadenspunkte/i,
  /auf die Bank gelegt/i,
  /in die Aktive Position gelegt/i,
]

export const validateBattleLog = (rawLog: string): BattleLogValidationResult => {
  const normalizedLog = rawLog.trim()

  const errors: string[] = []
  const warnings: string[] = []
  let score = 0

  if (!normalizedLog) {
    return {
      isValid: false,
      score: 0,
      errors: ['Bitte füge zuerst einen Kampflog ein.'],
      warnings: [],
    }
  }

  if (normalizedLog.length < 200) {
    errors.push('Der Text ist zu kurz für einen vollständigen PTCG-Live-Kampflog.')
  }

  const lines = normalizedLog
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 10) {
    errors.push('Der Text enthält zu wenige Zeilen für einen Kampflog.')
  }

  for (const requirement of REQUIRED_PATTERNS) {
    if (requirement.pattern.test(normalizedLog)) {
      score += 3
    } else {
      errors.push(requirement.message)
    }
  }

  const hasResult = RESULT_PATTERNS.some((pattern) => pattern.test(normalizedLog))

  if (hasResult) {
    score += 3
  } else {
    warnings.push('Es wurde kein eindeutiges Spielergebnis gefunden.')
  }

  const matchedHints = STRONG_HINT_PATTERNS.filter((pattern) => pattern.test(normalizedLog))

  score += matchedHints.length

  if (matchedHints.length < 3) {
    errors.push('Der Text enthält zu wenige typische PTCG-Live-Kampflog-Merkmale.')
  }

  const turnCount = lines.filter((line) => /^Zug von .+/i.test(line)).length

  if (turnCount >= 2) {
    score += 2
  } else if (turnCount === 1) {
    warnings.push('Der Kampflog enthält nur einen Zug.')
  }

  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
  }
}
