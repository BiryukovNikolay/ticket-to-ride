import { createEmptyPlayer, createInitialState } from '../game/initialState.js'
import { DEFAULT_GAME_VERSION, GAME_VERSIONS } from '../game/gameVersions.js'

const STORAGE_KEY_PREFIX = 'ticket-to-ride-score-state'
const ACTIVE_VERSION_KEY = 'ticket-to-ride-active-version'

function getStorageKey(gameVersion) {
  return `${STORAGE_KEY_PREFIX}:${gameVersion}`
}

function normalizePlayer(player, index) {
  const fallbackId = index + 1

  return {
    ...createEmptyPlayer(player?.id ?? fallbackId, player?.name || `Player ${player?.id ?? fallbackId}`),
    id: Number.isInteger(player?.id) ? player.id : fallbackId,
    name: typeof player?.name === 'string' && player.name.trim() ? player.name.trim() : `Player ${player?.id ?? fallbackId}`,
    routeCounts: {
      1: Number.parseInt(player?.routeCounts?.[1] ?? player?.routeCounts?.['1'] ?? 0, 10) || 0,
      2: Number.parseInt(player?.routeCounts?.[2] ?? player?.routeCounts?.['2'] ?? 0, 10) || 0,
      3: Number.parseInt(player?.routeCounts?.[3] ?? player?.routeCounts?.['3'] ?? 0, 10) || 0,
      4: Number.parseInt(player?.routeCounts?.[4] ?? player?.routeCounts?.['4'] ?? 0, 10) || 0,
      5: Number.parseInt(player?.routeCounts?.[5] ?? player?.routeCounts?.['5'] ?? 0, 10) || 0,
      6: Number.parseInt(player?.routeCounts?.[6] ?? player?.routeCounts?.['6'] ?? 0, 10) || 0,
    },
    tickets: Array.isArray(player?.tickets)
      ? player.tickets.map((ticket, ticketIndex) => ({
          id: Number.isInteger(ticket?.id) ? ticket.id : ticketIndex + 1,
          name: typeof ticket?.name === 'string' && ticket.name.trim() ? ticket.name.trim() : `Ticket ${ticketIndex + 1}`,
          points: Number.parseInt(ticket?.points ?? 0, 10) || 0,
          completed: Boolean(ticket?.completed),
        }))
      : [],
    longestPath: Boolean(player?.longestPath),
    unusedStations: Number.parseInt(player?.unusedStations ?? 0, 10) || 0,
    bulletTrainProgress: Number.parseInt(player?.bulletTrainProgress ?? 0, 10) || 0,
    italyNetworks: Array.isArray(player?.italyNetworks)
      ? player.italyNetworks.map((network, networkIndex) => ({
          id: Number.isInteger(network?.id) ? network.id : networkIndex + 1,
          regions: Number.parseInt(network?.regions ?? 0, 10) || 0,
        }))
      : [],
  }
}

function normalizeState(savedState) {
  const normalizedVersion = Object.values(GAME_VERSIONS).includes(savedState?.gameVersion)
    ? savedState.gameVersion
    : DEFAULT_GAME_VERSION
  const fallbackState = createInitialState(normalizedVersion)

  if (!savedState || !Array.isArray(savedState.players) || savedState.players.length === 0) {
    return fallbackState
  }

  const players = savedState.players.map(normalizePlayer)
  const currentPlayerExists = players.some((player) => player.id === savedState.currentPlayerId)

  return {
    gameVersion: normalizedVersion,
    players,
    currentPlayerId: currentPlayerExists ? savedState.currentPlayerId : players[0].id,
  }
}

export function loadStoredState() {
  const activeVersion = window.localStorage.getItem(ACTIVE_VERSION_KEY)
  const normalizedVersion = Object.values(GAME_VERSIONS).includes(activeVersion)
    ? activeVersion
    : DEFAULT_GAME_VERSION

  return loadStoredStateForVersion(normalizedVersion)
}

export function loadStoredStateForVersion(gameVersion = DEFAULT_GAME_VERSION) {
  try {
    const rawState = window.localStorage.getItem(getStorageKey(gameVersion))

    if (!rawState) {
      return createInitialState(gameVersion)
    }

    return normalizeState(JSON.parse(rawState))
  } catch {
    return createInitialState(gameVersion)
  }
}

export function saveStoredState(state) {
  window.localStorage.setItem(ACTIVE_VERSION_KEY, state.gameVersion)
  window.localStorage.setItem(getStorageKey(state.gameVersion), JSON.stringify(state))
}

export function clearStoredState(gameVersion = DEFAULT_GAME_VERSION) {
  window.localStorage.removeItem(getStorageKey(gameVersion))

  const activeVersion = window.localStorage.getItem(ACTIVE_VERSION_KEY)

  if (activeVersion === gameVersion) {
    window.localStorage.removeItem(ACTIVE_VERSION_KEY)
  }
}