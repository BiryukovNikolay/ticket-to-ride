import { createEmptyPlayer, createInitialState } from '../game/initialState.js'
import { calculateFinalScore } from '../game/calculateScore.js'
import { clearStoredState, loadStoredState, saveStoredState } from './storage.js'
import { createAppTemplate } from './template.js'

let ticketId = 0
let playerId = 1

function sanitizeNumberInput(input) {
  const parsedValue = Number.parseInt(input.value, 10)
  input.value = Number.isNaN(parsedValue) || parsedValue < 0 ? '0' : String(parsedValue)
  return Number.parseInt(input.value, 10)
}

function getCurrentPlayer(state) {
  return state.players.find((player) => player.id === state.currentPlayerId)
}

function getMaxPlayerId(players) {
  return players.reduce((maxPlayerId, player) => Math.max(maxPlayerId, player.id), 1)
}

function getMaxTicketId(players) {
  return players.reduce((maxTicketId, player) => {
    const playerMaxTicketId = player.tickets.reduce((playerMax, ticket) => Math.max(playerMax, ticket.id), 0)
    return Math.max(maxTicketId, playerMaxTicketId)
  }, 0)
}

function formatPlayerCount(count) {
  return `${count} player${count === 1 ? '' : 's'}`
}

function loadPlayerIntoForm(elements, player) {
  elements.playerName.value = player.name
  elements.currentPlayerMeta.textContent = `Editing ${player.name}`
  elements.routeInputs.forEach((input) => {
    input.value = String(player.routeCounts[input.dataset.routeLength] ?? 0)
  })
  elements.longestPath.checked = player.longestPath
  elements.unusedStations.value = String(player.unusedStations ?? 0)
  elements.ticketForm.reset()
}

function renderPlayerList(elements, state) {
  elements.playerCount.textContent = formatPlayerCount(state.players.length)
  elements.playerList.innerHTML = state.players
    .map(
      (player, index) => `
        <div class="player-chip ${player.id === state.currentPlayerId ? 'player-chip--active' : ''}">
          <button
            class="player-chip__main"
            type="button"
            data-player-id="${player.id}"
          >
            <span class="player-chip__order">${index + 1}</span>
            <span>${player.name}</span>
          </button>
          <button
            class="player-chip__remove"
            type="button"
            data-remove-player-id="${player.id}"
            aria-label="Remove ${player.name}"
            ${state.players.length === 1 ? 'disabled' : ''}
          >
            <span aria-hidden="true">&#215;</span>
          </button>
        </div>
      `,
    )
    .join('')
}

function removePlayer(state, playerIdToRemove) {
  if (state.players.length === 1) {
    return state.currentPlayerId
  }

  const removedPlayerIndex = state.players.findIndex((player) => player.id === playerIdToRemove)

  if (removedPlayerIndex === -1) {
    return state.currentPlayerId
  }

  state.players = state.players.filter((player) => player.id !== playerIdToRemove)

  if (state.currentPlayerId !== playerIdToRemove) {
    return state.currentPlayerId
  }

  const fallbackIndex = Math.max(0, removedPlayerIndex - 1)
  return state.players[fallbackIndex]?.id ?? state.players[0].id
}

function renderTicketList(elements, player) {
  if (player.tickets.length === 0) {
    elements.ticketList.innerHTML = ''
    elements.ticketEmptyState.hidden = false
    return
  }

  elements.ticketEmptyState.hidden = true
  elements.ticketList.innerHTML = player.tickets
    .map(
      (ticket) => `
        <li class="ticket-item">
          <div>
            <strong>${ticket.name}</strong>
            <p>${ticket.completed ? 'Completed' : 'Failed'}</p>
          </div>
          <div class="ticket-item__meta">
            <span class="ticket-points ${ticket.completed ? 'ticket-points--positive' : 'ticket-points--negative'}">
              ${ticket.completed ? '+' : '-'}${ticket.points}
            </span>
            <button class="button button--tiny button--ghost" type="button" data-ticket-id="${ticket.id}">Remove</button>
          </div>
        </li>
      `,
    )
    .join('')
}

function renderScore(elements, player) {
  const score = calculateFinalScore(player)

  elements.routeScore.textContent = String(score.routeScore)
  elements.ticketScore.textContent = String(score.ticketScore)
  elements.bonusScore.textContent = String(score.longestPathBonus)
  elements.stationScore.textContent = String(score.stationScore)
  elements.totalScore.textContent = String(score.totalScore)
  elements.ticketSummary.textContent = `${score.completedTickets} completed, ${score.failedTickets} failed.`
}

function renderStandings(elements, state) {
  elements.standingsBody.innerHTML = state.players
    .map((player) => {
      const score = calculateFinalScore(player)

      return `
        <tr class="${player.id === state.currentPlayerId ? 'standings-table__row--active' : ''}">
          <td>${player.name}</td>
          <td>${score.routeScore}</td>
          <td>${score.ticketScore}</td>
          <td>${score.longestPathBonus}</td>
          <td>${score.stationScore}</td>
          <td><strong>${score.totalScore}</strong></td>
          <td>
            <button class="button button--tiny button--ghost" type="button" data-edit-player-id="${player.id}">
              Edit
            </button>
          </td>
        </tr>
      `
    })
    .join('')
}

function renderWinner(elements, state) {
  const playersWithScores = state.players.map((player) => ({
    player,
    score: calculateFinalScore(player),
  }))
  const highestScore = Math.max(...playersWithScores.map(({ score }) => score.totalScore))
  const winners = playersWithScores.filter(({ score }) => score.totalScore === highestScore)

  if (winners.length === 1) {
    elements.winnerName.textContent = winners[0].player.name
    elements.winnerMeta.textContent = `Leading with ${highestScore} points.`
    return
  }

  elements.winnerName.textContent = winners.map(({ player }) => player.name).join(', ')
  elements.winnerMeta.textContent = `Tie at ${highestScore} points.`
}

function getElements(root) {
  return {
    playerName: root.querySelector('#player-name'),
    currentPlayerMeta: root.querySelector('#current-player-meta'),
    addPlayerButton: root.querySelector('#add-player-button'),
    newGameButton: root.querySelector('#new-game-button'),
    playerList: root.querySelector('#player-list'),
    playerCount: root.querySelector('#player-count'),
    ticketForm: root.querySelector('#ticket-form'),
    ticketName: root.querySelector('#ticket-name'),
    ticketPoints: root.querySelector('#ticket-points'),
    ticketStatus: root.querySelector('#ticket-status'),
    ticketList: root.querySelector('#ticket-list'),
    ticketEmptyState: root.querySelector('#ticket-empty-state'),
    longestPath: root.querySelector('#longest-path'),
    unusedStations: root.querySelector('#unused-stations'),
    resetButton: root.querySelector('#reset-button'),
    routeScore: root.querySelector('#route-score'),
    ticketScore: root.querySelector('#ticket-score'),
    bonusScore: root.querySelector('#bonus-score'),
    stationScore: root.querySelector('#station-score'),
    totalScore: root.querySelector('#total-score'),
    ticketSummary: root.querySelector('#ticket-summary'),
    winnerName: root.querySelector('#winner-name'),
    winnerMeta: root.querySelector('#winner-meta'),
    standingsBody: root.querySelector('#standings-body'),
    routeInputs: [...root.querySelectorAll('[data-route-length]')],
  }
}

function syncRouteCounts(elements, player) {
  elements.routeInputs.forEach((input) => {
    player.routeCounts[input.dataset.routeLength] = sanitizeNumberInput(input)
  })
}

function resetPlayer(player) {
  const freshPlayer = createEmptyPlayer(player.id, player.name)

  player.routeCounts = freshPlayer.routeCounts
  player.tickets = freshPlayer.tickets
  player.longestPath = freshPlayer.longestPath
}

function replaceState(state, nextState) {
  state.players = nextState.players
  state.currentPlayerId = nextState.currentPlayerId
}

export function initApp(root) {
  const state = loadStoredState()
  playerId = getMaxPlayerId(state.players)
  ticketId = getMaxTicketId(state.players)

  root.innerHTML = createAppTemplate()
  const elements = getElements(root)

  function rerender() {
    const currentPlayer = getCurrentPlayer(state)

    renderPlayerList(elements, state)
    renderTicketList(elements, currentPlayer)
    renderScore(elements, currentPlayer)
    renderStandings(elements, state)
    renderWinner(elements, state)
    saveStoredState(state)
  }

  function switchToPlayer(nextPlayerId) {
    state.currentPlayerId = nextPlayerId
    const currentPlayer = getCurrentPlayer(state)
    loadPlayerIntoForm(elements, currentPlayer)
    rerender()
  }

  elements.routeInputs.forEach((input) => {
    input.addEventListener('input', () => {
      const currentPlayer = getCurrentPlayer(state)
      currentPlayer.routeCounts[input.dataset.routeLength] = sanitizeNumberInput(input)
      rerender()
    })
  })

  elements.playerName.addEventListener('input', () => {
    const currentPlayer = getCurrentPlayer(state)
    const trimmedName = elements.playerName.value.trim()
    currentPlayer.name = trimmedName || `Player ${currentPlayer.id}`
    elements.currentPlayerMeta.textContent = `Editing ${currentPlayer.name}`
    rerender()
  })

  elements.addPlayerButton.addEventListener('click', () => {
    playerId += 1
    state.players.push(createEmptyPlayer(playerId))
    switchToPlayer(playerId)
    elements.playerName.focus()
    elements.playerName.select()
  })

  elements.newGameButton.addEventListener('click', () => {
    const freshState = createInitialState()

    replaceState(state, freshState)
    playerId = getMaxPlayerId(state.players)
    ticketId = 0
    clearStoredState()
    loadPlayerIntoForm(elements, getCurrentPlayer(state))
    syncRouteCounts(elements, getCurrentPlayer(state))
    rerender()
  })

  elements.playerList.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-player-id]')

    if (removeButton) {
      const nextPlayerId = removePlayer(state, Number.parseInt(removeButton.dataset.removePlayerId, 10))
      switchToPlayer(nextPlayerId)
      return
    }

    const button = event.target.closest('[data-player-id]')

    if (!button) {
      return
    }

    switchToPlayer(Number.parseInt(button.dataset.playerId, 10))
  })

  elements.ticketForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const points = sanitizeNumberInput(elements.ticketPoints)
    const name = elements.ticketName.value.trim() || `Ticket ${ticketId + 1}`

    if (points === 0) {
      elements.ticketPoints.focus()
      return
    }

    ticketId += 1
    getCurrentPlayer(state).tickets.push({
      id: ticketId,
      name,
      points,
      completed: elements.ticketStatus.value === 'completed',
    })

    elements.ticketForm.reset()
    rerender()
  })

  elements.ticketList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-ticket-id]')

    if (!button) {
      return
    }

    const ticketIdToRemove = Number.parseInt(button.dataset.ticketId, 10)
    const currentPlayer = getCurrentPlayer(state)
    currentPlayer.tickets = currentPlayer.tickets.filter((ticket) => ticket.id !== ticketIdToRemove)
    rerender()
  })

  elements.standingsBody.addEventListener('click', (event) => {
    const button = event.target.closest('[data-edit-player-id]')

    if (!button) {
      return
    }

    switchToPlayer(Number.parseInt(button.dataset.editPlayerId, 10))
    elements.playerName.focus()
  })

  elements.longestPath.addEventListener('change', () => {
    getCurrentPlayer(state).longestPath = elements.longestPath.checked
    rerender()
  })

  elements.unusedStations.addEventListener('input', () => {
    const currentPlayer = getCurrentPlayer(state)
    const nextValue = sanitizeNumberInput(elements.unusedStations)
    currentPlayer.unusedStations = Math.min(3, nextValue)
    elements.unusedStations.value = String(currentPlayer.unusedStations)
    rerender()
  })

  elements.resetButton.addEventListener('click', () => {
    const currentPlayer = getCurrentPlayer(state)
    resetPlayer(currentPlayer)
    loadPlayerIntoForm(elements, currentPlayer)
    syncRouteCounts(elements, currentPlayer)
    rerender()
  })

  loadPlayerIntoForm(elements, getCurrentPlayer(state))
  syncRouteCounts(elements, getCurrentPlayer(state))
  rerender()
}