export type BattleLogResult = 'win' | 'loss' | 'draw' | 'unknown'

export type BattleLog = {
  id: string
  player_name: string | null
  own_deck_name: string | null
  own_pokemon_1_name: string | null
  own_pokemon_1_sprite_url: string | null
  own_pokemon_2_name: string | null
  own_pokemon_2_sprite_url: string | null
  opponent_name?: string | null
  opponent_deck_name: string | null
  opponent_pokemon_1_name: string | null
  opponent_pokemon_1_sprite_url: string | null
  opponent_pokemon_2_name: string | null
  opponent_pokemon_2_sprite_url: string | null
  result: BattleLogResult
  went_first: boolean | null
  format: string | null
  raw_log?: string | null
  played_at: string
  created_at?: string
}

export type MatchupDeckRow = {
  deckName: string
  pokemon1Name: string | null
  pokemon1SpriteUrl: string | null
  pokemon2Name: string | null
  pokemon2SpriteUrl: string | null
  wins: number
  losses: number
  draws: number
  unknown: number
  total: number
  winRate: number
  lastPlayed: string
  logs: BattleLog[]
}

export type OpponentMatchupRow = {
  opponentDeckName: string
  opponentPokemon1Name: string | null
  opponentPokemon1SpriteUrl: string | null
  opponentPokemon2Name: string | null
  opponentPokemon2SpriteUrl: string | null
  wins: number
  losses: number
  draws: number
  unknown: number
  total: number
  winRate: number
  lastPlayed: string
  logs: BattleLog[]
}
