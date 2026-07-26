import { DEFAULT_GAME_VERSION } from './gameVersions.js'
import { DEFAULT_PLAYER_COLOR } from './playerColors.js'

export function createEmptyPlayer(id, name = `Player ${id}`, color = DEFAULT_PLAYER_COLOR) {
  return {
    id,
    name,
    color,
    routeCounts: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    },
    tickets: [],
    longestPath: false,
    unusedStations: 0,
    bulletTrainProgress: 0,
    italyNetworks: [],
  }
}

export function createInitialState(gameVersion = DEFAULT_GAME_VERSION) {
  return {
    gameVersion,
    players: [createEmptyPlayer(1)],
    currentPlayerId: 1,
  }
}