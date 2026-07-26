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
  }
}

export function createInitialState() {
  return {
    players: [createEmptyPlayer(1)],
    currentPlayerId: 1,
  }
}