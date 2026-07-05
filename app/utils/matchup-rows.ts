import type {
  BattleLog,
  MatchupDeckRow,
  OpponentMatchupRow,
} from '~/types/battle-log'

const applyResultToRow = (
  row: {
    wins: number
    losses: number
    draws: number
    unknown: number
    total: number
  },
  result: BattleLog['result'],
) => {
  if (result === 'win') {
    row.wins += 1
  } else if (result === 'loss') {
    row.losses += 1
  } else if (result === 'draw') {
    row.draws += 1
  } else {
    row.unknown += 1
  }

  row.total += 1
}

const getWinRate = (wins: number, losses: number) => {
  const decidedGames = wins + losses

  return decidedGames > 0
    ? (wins / decidedGames) * 100
    : 0
}

export const createDeckRows = (logs: BattleLog[]): MatchupDeckRow[] => {
  const deckMap = new Map<string, MatchupDeckRow>()

  for (const log of logs) {
    const deckName = log.own_deck_name || 'Unbekanntes Deck'

    if (!deckMap.has(deckName)) {
      deckMap.set(deckName, {
        deckName,
        pokemon1Name: log.own_pokemon_1_name,
        pokemon1SpriteUrl: log.own_pokemon_1_sprite_url,
        pokemon2Name: log.own_pokemon_2_name,
        pokemon2SpriteUrl: log.own_pokemon_2_sprite_url,
        wins: 0,
        losses: 0,
        draws: 0,
        unknown: 0,
        total: 0,
        winRate: 0,
        lastPlayed: log.played_at,
        logs: [],
      })
    }

    const row = deckMap.get(deckName)

    if (!row) {
      continue
    }

    row.logs.push(log)
    applyResultToRow(row, log.result)

    if (new Date(log.played_at) > new Date(row.lastPlayed)) {
      row.lastPlayed = log.played_at
      row.pokemon1Name = log.own_pokemon_1_name
      row.pokemon1SpriteUrl = log.own_pokemon_1_sprite_url
      row.pokemon2Name = log.own_pokemon_2_name
      row.pokemon2SpriteUrl = log.own_pokemon_2_sprite_url
    }
  }

  return Array.from(deckMap.values())
    .map((row) => ({
      ...row,
      winRate: getWinRate(row.wins, row.losses),
    }))
    .sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
}

export const createOpponentMatchupRows = (logs: BattleLog[]): OpponentMatchupRow[] => {
  const matchupMap = new Map<string, OpponentMatchupRow>()

  for (const log of logs) {
    const opponentDeckName = log.opponent_deck_name || 'Unbekanntes Deck'

    if (!matchupMap.has(opponentDeckName)) {
      matchupMap.set(opponentDeckName, {
        opponentDeckName,
        opponentPokemon1Name: log.opponent_pokemon_1_name,
        opponentPokemon1SpriteUrl: log.opponent_pokemon_1_sprite_url,
        opponentPokemon2Name: log.opponent_pokemon_2_name,
        opponentPokemon2SpriteUrl: log.opponent_pokemon_2_sprite_url,
        wins: 0,
        losses: 0,
        draws: 0,
        unknown: 0,
        total: 0,
        winRate: 0,
        lastPlayed: log.played_at,
        logs: [],
      })
    }

    const row = matchupMap.get(opponentDeckName)

    if (!row) {
      continue
    }

    row.logs.push(log)
    applyResultToRow(row, log.result)

    if (new Date(log.played_at) > new Date(row.lastPlayed)) {
      row.lastPlayed = log.played_at
      row.opponentPokemon1Name = log.opponent_pokemon_1_name
      row.opponentPokemon1SpriteUrl = log.opponent_pokemon_1_sprite_url
      row.opponentPokemon2Name = log.opponent_pokemon_2_name
      row.opponentPokemon2SpriteUrl = log.opponent_pokemon_2_sprite_url
    }
  }

  return Array.from(matchupMap.values())
    .map((row) => ({
      ...row,
      winRate: getWinRate(row.wins, row.losses),
    }))
    .sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
}
