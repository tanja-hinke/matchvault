export type ParsedBattleLog = {
  playerName: string
  opponentName: string | null
  result: 'win' | 'loss' | 'draw' | 'unknown'
  wentFirst: boolean | null
  firstPlayerName: string | null
  winnerName: string | null
}

const escapeRegExp = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const getLines = (rawLog: string) => {
  return rawLog
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

const parseWinnerName = (rawLog: string) => {
  const winnerMatch = rawLog.match(/([^\n.]+?) hat gewonnen\./i)
  const winnerName = winnerMatch?.[1]

  if (!winnerName) {
    return null
  }

  return winnerName.trim()
}

const parseFirstPlayerName = (lines: string[]) => {
  const firstTurnLine = lines.find((line) => /^Zug von .+/i.test(line))

  if (!firstTurnLine) {
    return null
  }

  return firstTurnLine.replace(/^Zug von\s+/i, '').trim()
}

const parseOpponentNameFromCoinFlip = (lines: string[], playerName: string) => {
  const escapedPlayerName = escapeRegExp(playerName)

  const coinFlipLine = lines.find((line) => (
    line.includes('Münzwurf')
    && !new RegExp(`^${escapedPlayerName}\\s+`, 'i').test(line)
  ))

  if (!coinFlipLine) {
    return null
  }

  const match = coinFlipLine.match(/^(.+?) hat /i)

  const opponentName = match?.[1]

  if (!opponentName) {
    return null
  }

  return opponentName.trim()
}

const parseOpponentNameFromTurns = (lines: string[], playerName: string) => {
  const turnNames = lines
    .filter((line) => /^Zug von .+/i.test(line))
    .map((line) => line.replace(/^Zug von\s+/i, '').trim())

  const opponentName = turnNames.find((name) => name !== playerName)

  return opponentName ?? null
}

const parseOpponentNameFromWinner = (
  winnerName: string | null,
  playerName: string,
) => {
  if (!winnerName || winnerName === playerName) {
    return null
  }

  return winnerName
}

const parseResult = (
  winnerName: string | null,
  playerName: string,
): ParsedBattleLog['result'] => {
  if (!winnerName) {
    return 'unknown'
  }

  return winnerName === playerName ? 'win' : 'loss'
}

export const parseBattleLog = (
  rawLog: string,
  playerName: string,
): ParsedBattleLog => {
  const normalizedPlayerName = playerName.trim()
  const lines = getLines(rawLog)

  const winnerName = parseWinnerName(rawLog)
  const firstPlayerName = parseFirstPlayerName(lines)

  const opponentName =
    parseOpponentNameFromTurns(lines, normalizedPlayerName)
    ?? parseOpponentNameFromCoinFlip(lines, normalizedPlayerName)
    ?? parseOpponentNameFromWinner(winnerName, normalizedPlayerName)

  const result = parseResult(winnerName, normalizedPlayerName)

  const wentFirst = firstPlayerName
    ? firstPlayerName === normalizedPlayerName
    : null

  return {
    playerName: normalizedPlayerName,
    opponentName,
    result,
    wentFirst,
    firstPlayerName,
    winnerName,
  }
}
