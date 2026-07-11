import type { BattleLogResult } from '~/types/battle-log'

export const formatBattleLogDate = (dateValue: string) => {
  return new Intl.DateTimeFormat('de-DE', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateValue))
}

export const formatBattleLogTime = (dateValue: string) => {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue))
}

export const formatWinRate = (value: number) => {
  return `${value.toFixed(2)}%`
}

export const getResultLabel = (result: BattleLogResult) => {
  if (result === 'win') {
    return 'Win'
  }

  if (result === 'loss') {
    return 'Loss'
  }

  if (result === 'draw') {
    return 'Draw'
  }

  return 'Unknown'
}

export const getResultBadgeClasses = (result: BattleLogResult) => {
  if (result === 'win') {
    return 'bg-emerald-100 text-emerald-800'
  }

  if (result === 'loss') {
    return 'bg-red-100 text-red-800'
  }

  if (result === 'draw') {
    return 'bg-amber-100 text-amber-800'
  }

  return 'bg-slate-200 text-slate-700'
}

export const getResultCardClasses = (result: BattleLogResult) => {
  if (result === 'win') {
    return 'border-emerald-100 bg-emerald-50 text-emerald-800 hover:border-emerald-200 hover:bg-emerald-100/60'
  }

  if (result === 'loss') {
    return 'border-red-100 bg-red-50 text-red-800 hover:border-red-200 hover:bg-red-100/60'
  }

  if (result === 'draw') {
    return 'border-amber-100 bg-amber-50 text-amber-800 hover:border-amber-200 hover:bg-amber-100/60'
  }

  return 'border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200/60'
}
