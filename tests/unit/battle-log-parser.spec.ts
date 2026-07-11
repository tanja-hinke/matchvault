import { describe, expect, it } from 'vitest'
import { parseBattleLog } from '~/utils/battle-log-parser'

describe('battle-log-parser', () => {
    it('setzt den Spielernamen aus dem Parameter', () => {
        const result = parseBattleLog('', 'Ash')

        expect(result.playerName).toBe('Ash')
    })

    it('trimmt den Spielernamen', () => {
        const result = parseBattleLog('', '  Ash  ')

        expect(result.playerName).toBe('Ash')
    })

    it('erkennt einen Sieg des Spielers', () => {
        const rawLog = `
Zug von Ash
Zug von Gary
Ash hat gewonnen.
`

        const result = parseBattleLog(rawLog, 'Ash')

        expect(result.result).toBe('win')
        expect(result.winnerName).toBe('Ash')
    })

    it('erkennt eine Niederlage des Spielers', () => {
        const rawLog = `
Zug von Ash
Zug von Gary
Gary hat gewonnen.
`

        const result = parseBattleLog(rawLog, 'Ash')

        expect(result.result).toBe('loss')
        expect(result.winnerName).toBe('Gary')
    })

    it('erkennt den Gegner aus den Zug-Zeilen', () => {
        const rawLog = `
Zug von Ash
Zug von Gary
Ash hat gewonnen.
`

        const result = parseBattleLog(rawLog, 'Ash')

        expect(result.opponentName).toBe('Gary')
    })

    it('erkennt, dass der Spieler angefangen hat', () => {
        const rawLog = `
Zug von Ash
Zug von Gary
Ash hat gewonnen.
`

        const result = parseBattleLog(rawLog, 'Ash')

        expect(result.firstPlayerName).toBe('Ash')
        expect(result.wentFirst).toBe(true)
    })

    it('erkennt, dass der Gegner angefangen hat', () => {
        const rawLog = `
Zug von Gary
Zug von Ash
Ash hat gewonnen.
`

        const result = parseBattleLog(rawLog, 'Ash')

        expect(result.firstPlayerName).toBe('Gary')
        expect(result.wentFirst).toBe(false)
    })

    it('setzt wentFirst auf null, wenn kein erster Spieler erkannt wird', () => {
        const rawLog = `
Ash hat gewonnen.
`

        const result = parseBattleLog(rawLog, 'Ash')

        expect(result.wentFirst).toBe(null)
    })
})