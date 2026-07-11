import { describe, expect, it } from 'vitest'
import { validateBattleLog } from '~/utils/battle-log-validator'

const validBattleLog = `
Vorbereitung
Münzwurf
Starthand
Aktive Position
Pikachu wurde in die Aktive Position gelegt.
Bisasam wurde auf die Bank gelegt.

Zug von Spieler
Spieler hat eine Karte gezogen.
Spieler hat Energie gespielt.
Spieler hat den eigenen Zug beendet.

Zug von Gegner
Gegner hat eine Karte gezogen.
Gegner hat eine Karte gespielt.
Gegner hat den eigenen Zug beendet.

Zug von Spieler
Spieler hat eine Karte gezogen.
Spieler hat Pikachu gespielt.
Pikachu verursacht Schadenspunkte.
Spieler hat gewonnen.
`.repeat(3)

describe('battle-log-validator', () => {
    it('lehnt einen leeren Kampflog ab', () => {
        const result = validateBattleLog('')

        expect(result.isValid).toBe(false)
        expect(result.score).toBe(0)
        expect(result.errors).toContain('Bitte füge zuerst einen Kampflog ein.')
        expect(result.warnings).toEqual([])
    })

    it('lehnt einen zu kurzen Kampflog ab', () => {
        const result = validateBattleLog('Vorbereitung\nZug von Spieler')

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Der Text ist zu kurz für einen vollständigen PTCG-Live-Kampflog.')
    })

    it('akzeptiert einen vollständigen Kampflog', () => {
        const result = validateBattleLog(validBattleLog)

        expect(result.isValid).toBe(true)
        expect(result.errors).toEqual([])
        expect(result.score).toBeGreaterThan(0)
    })

    it('meldet einen fehlenden Vorbereitungsabschnitt', () => {
        const logWithoutPreparation = validBattleLog.replaceAll('Vorbereitung', 'Intro')

        const result = validateBattleLog(logWithoutPreparation)

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Der Kampflog muss einen Abschnitt "Vorbereitung" enthalten.')
    })

    it('meldet fehlende Zug-Abschnitte', () => {
        const logWithoutTurns = validBattleLog.replace(/^Zug von .+$/gim, 'Spieler ist dran')

        const result = validateBattleLog(logWithoutTurns)

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Der Kampflog muss mindestens einen Abschnitt "Zug von ..." enthalten.')
    })

    it('gibt eine Warnung aus, wenn kein eindeutiges Ergebnis gefunden wird', () => {
        const logWithoutResult = validBattleLog.replaceAll('Spieler hat gewonnen.', '')

        const result = validateBattleLog(logWithoutResult)

        expect(result.warnings).toContain('Es wurde kein eindeutiges Spielergebnis gefunden.')
    })
})