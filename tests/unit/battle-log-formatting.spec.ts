import { describe, expect, it } from 'vitest'
import {
    formatBattleLogDate,
    formatBattleLogTime,
    formatWinRate,
    getResultBadgeClasses,
    getResultCardClasses,
    getResultLabel,
} from '~/utils/battle-log-formatting'

describe('battle-log-formatting', () => {
    describe('formatBattleLogDate', () => {
        it('formatiert ein Datum auf Deutsch', () => {
            const result = formatBattleLogDate('2026-07-11T12:00:00.000Z')

            expect(result).toContain('2026')
            expect(result).toMatch(/Juli|Jul/)
        })
    })

    describe('formatBattleLogTime', () => {
        it('formatiert eine Uhrzeit mit Stunden und Minuten', () => {
            const result = formatBattleLogTime('2026-07-11T12:30:00.000Z')

            expect(result).toMatch(/\d{2}:\d{2}/)
        })
    })

    describe('formatWinRate', () => {
        it('formatiert eine Winrate mit zwei Nachkommastellen', () => {
            expect(formatWinRate(66.666)).toBe('66.67%')
        })

        it('formatiert 0 Prozent korrekt', () => {
            expect(formatWinRate(0)).toBe('0.00%')
        })

        it('formatiert 100 Prozent korrekt', () => {
            expect(formatWinRate(100)).toBe('100.00%')
        })
    })

    describe('getResultLabel', () => {
        it('gibt das Label für einen Sieg zurück', () => {
            expect(getResultLabel('win')).toBe('Win')
        })

        it('gibt das Label für eine Niederlage zurück', () => {
            expect(getResultLabel('loss')).toBe('Loss')
        })

        it('gibt das Label für ein Unentschieden zurück', () => {
            expect(getResultLabel('draw')).toBe('Draw')
        })

        it('gibt das Label für ein unbekanntes Ergebnis zurück', () => {
            expect(getResultLabel('unknown')).toBe('Unknown')
        })
    })

    describe('getResultBadgeClasses', () => {
        it('gibt grüne Klassen für einen Sieg zurück', () => {
            expect(getResultBadgeClasses('win')).toContain('emerald')
        })

        it('gibt rote Klassen für eine Niederlage zurück', () => {
            expect(getResultBadgeClasses('loss')).toContain('red')
        })

        it('gibt gelbe Klassen für ein Unentschieden zurück', () => {
            expect(getResultBadgeClasses('draw')).toContain('amber')
        })

        it('gibt neutrale Klassen für ein unbekanntes Ergebnis zurück', () => {
            expect(getResultBadgeClasses('unknown')).toContain('slate')
        })
    })

    describe('getResultCardClasses', () => {
        it('gibt grüne Card-Klassen für einen Sieg zurück', () => {
            expect(getResultCardClasses('win')).toContain('emerald')
        })

        it('gibt rote Card-Klassen für eine Niederlage zurück', () => {
            expect(getResultCardClasses('loss')).toContain('red')
        })

        it('gibt gelbe Card-Klassen für ein Unentschieden zurück', () => {
            expect(getResultCardClasses('draw')).toContain('amber')
        })

        it('gibt neutrale Card-Klassen für ein unbekanntes Ergebnis zurück', () => {
            expect(getResultCardClasses('unknown')).toContain('slate')
        })
    })
})