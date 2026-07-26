export const GAME_VERSIONS = {
  EUROPE: 'europe',
  JAPAN: 'japan',
}

export const DEFAULT_GAME_VERSION = GAME_VERSIONS.EUROPE

export const VERSION_OPTIONS = [
  {
    value: GAME_VERSIONS.EUROPE,
    label: 'Europe',
    eyebrow: 'Ticket to Ride: Europe',
    title: 'Europe Score Calculator',
    description: 'Scores routes, destination tickets, unused stations, and the European Express longest route bonus.',
    routeDescription: 'Enter only your regular route claims. Ferries and tunnels still score by route length.',
    ticketDescription: 'Completed tickets add points, failed tickets subtract points.',
    bonusTitle: 'Europe Bonuses',
    bonusDescription: 'Europe uses the longest route bonus and 4 points for each unused station.',
    routeScoreLabel: 'Route Points',
    bonusScoreLabel: 'Longest Route Bonus',
    extraScoreLabel: 'Unused Stations',
    standingsBonusLabel: 'Longest',
    standingsExtraLabel: 'Stations',
    winnerLabel: 'Winner',
    helpNote: 'Switching version starts a fresh score sheet for the selected map.',
  },
  {
    value: GAME_VERSIONS.JAPAN,
    label: 'Japan',
    eyebrow: 'Ticket to Ride: Japan',
    title: 'Japan Score Calculator',
    description: 'Scores regular routes, destination tickets, and the shared Bullet Train bonus track for the Japan map.',
    routeDescription: 'Enter only your regular route claims. Bullet Train routes do not score route points directly.',
    ticketDescription: 'Completed tickets may use any claimed Bullet Train routes and failed tickets still subtract points.',
    bonusTitle: 'Japan Bullet Train',
    bonusDescription: 'Japan has no Longest Route or station scoring. Bullet Train bonus depends on every player\'s track position.',
    routeScoreLabel: 'Route Points',
    bonusScoreLabel: 'Bullet Train Bonus',
    extraScoreLabel: 'Bullet Train Track',
    standingsBonusLabel: 'Bullet',
    standingsExtraLabel: 'Track',
    winnerLabel: 'Leader',
    helpNote: 'Switching version starts a fresh score sheet for the selected map.',
  },
]

export function getVersionConfig(gameVersion) {
  return VERSION_OPTIONS.find((option) => option.value === gameVersion) ?? VERSION_OPTIONS[0]
}