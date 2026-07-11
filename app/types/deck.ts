export interface Deck {
  id: string
  user_id: string
  name: string
  pokemon_1_name: string
  pokemon_1_sprite_url: string | null
  pokemon_2_name: string | null
  pokemon_2_sprite_url: string | null
  created_at: string
}
