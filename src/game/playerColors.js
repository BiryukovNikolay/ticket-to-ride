export const PLAYER_COLORS = [
  {
    value: 'black',
    label: 'Black',
    background: '#2f2924',
    contrast: '#f7f3ec',
    overlay: 'rgba(255, 255, 255, 0.14)',
  },
  {
    value: 'yellow',
    label: 'Yellow',
    background: '#d2a21c',
    contrast: '#2b2218',
    overlay: 'rgba(43, 34, 24, 0.12)',
  },
  {
    value: 'red',
    label: 'Red',
    background: '#c04236',
    contrast: '#fff7f4',
    overlay: 'rgba(255, 255, 255, 0.14)',
  },
  {
    value: 'green',
    label: 'Green',
    background: '#2d7b5c',
    contrast: '#f4fbf8',
    overlay: 'rgba(255, 255, 255, 0.12)',
  },
  {
    value: 'blue',
    label: 'Blue',
    background: '#2f5f9b',
    contrast: '#f4f8fd',
    overlay: 'rgba(255, 255, 255, 0.12)',
  },
]

export const DEFAULT_PLAYER_COLOR = PLAYER_COLORS[0].value

export function getPlayerColorConfig(color) {
  return PLAYER_COLORS.find((option) => option.value === color) ?? PLAYER_COLORS[0]
}

export function getNextAvailablePlayerColor(usedColors = []) {
  const usedColorSet = new Set(usedColors)

  return PLAYER_COLORS.find((option) => !usedColorSet.has(option.value))?.value ?? DEFAULT_PLAYER_COLOR
}
