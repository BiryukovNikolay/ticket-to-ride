import { DEFAULT_GAME_VERSION } from './gameVersions.js'

export function createEmptyPlayer(id, name = `Player ${id}`) {
  return {
    id,
    name,
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