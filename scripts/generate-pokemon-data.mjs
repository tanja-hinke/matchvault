import { mkdir, writeFile } from 'node:fs/promises'

const POKEMON_LIST_URL = 'https://pokeapi.co/api/v2/pokemon?limit=2000'
const OUTPUT_FILE = 'app/data/pokemon-de.json'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const formatPokemonName = (name) => {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const fetchJson = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${url}`)
  }

  return response.json()
}

const getGermanNameFromSpecies = (species) => {
  return species.names?.find((entry) => entry.language?.name === 'de')?.name ?? null
}

const getSpriteUrl = (pokemonDetails) => {
  return pokemonDetails.sprites?.front_default
    ?? pokemonDetails.sprites?.other?.['official-artwork']?.front_default
    ?? null
}

const main = async () => {
  console.log('Loading Pokémon list...')

  const list = await fetchJson(POKEMON_LIST_URL)
  const pokemon = list.results ?? []

  console.log(`Found ${pokemon.length} Pokémon/forms.`)

  const result = []

  for (const [index, entry] of pokemon.entries()) {
    try {
      console.log(`[${index + 1}/${pokemon.length}] ${entry.name}`)

      const details = await fetchJson(entry.url)
      const species = details.species?.url
        ? await fetchJson(details.species.url)
        : null

      const germanName = species
        ? getGermanNameFromSpecies(species)
        : null

      result.push({
        apiName: details.name,
        germanName: germanName ?? formatPokemonName(details.name),
        displayName: germanName ?? formatPokemonName(details.name),
        spriteUrl: getSpriteUrl(details),
        speciesName: details.species?.name ?? null,
        speciesUrl: details.species?.url ?? null,
      })

      await sleep(50)
    } catch (error) {
      console.warn(`Could not load ${entry.name}:`, error.message)

      result.push({
        apiName: entry.name,
        germanName: formatPokemonName(entry.name),
        displayName: formatPokemonName(entry.name),
        spriteUrl: null,
        speciesName: null,
        speciesUrl: null,
      })
    }
  }

  result.sort((a, b) => a.displayName.localeCompare(b.displayName, 'de'))

  await mkdir('app/data', { recursive: true })
  await writeFile(OUTPUT_FILE, `${JSON.stringify(result, null, 2)}\n`, 'utf8')

  console.log(`Done. Written ${result.length} entries to ${OUTPUT_FILE}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
