import { LONGEST_PATH_BONUS, ROUTE_SCORES, UNUSED_STATION_POINTS } from './routeScores.js'

function normalizeNumber(value) {
  const parsedValue = Number.parseInt(value, 10)

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return 0
  }

  return parsedValue
}

export function calculateRouteScore(routeCounts) {
  return Object.entries(ROUTE_SCORES).reduce((total, [length, points]) => {
    return total + normalizeNumber(routeCounts[length]) * points
  }, 0)
}

export function calculateTicketScore(tickets) {
  return tickets.reduce((total, ticket) => {
    const ticketPoints = normalizeNumber(ticket.points)
    return total + (ticket.completed ? ticketPoints : -ticketPoints)
  }, 0)
}

export function calculateFinalScore(state) {
  const routeScore = calculateRouteScore(state.routeCounts)
  const ticketScore = calculateTicketScore(state.tickets)
  const longestPathBonus = state.longestPath ? LONGEST_PATH_BONUS : 0
  const stationScore = normalizeNumber(state.unusedStations) * UNUSED_STATION_POINTS

  return {
    routeScore,
    ticketScore,
    longestPathBonus,
    stationScore,
    totalScore: routeScore + ticketScore + longestPathBonus + stationScore,
    completedTickets: state.tickets.filter((ticket) => ticket.completed).length,
    failedTickets: state.tickets.filter((ticket) => !ticket.completed).length,
  }
}