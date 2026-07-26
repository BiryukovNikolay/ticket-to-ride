import {
  ITALY_REGION_BONUS,
  JAPAN_BULLET_TRAIN_BONUS_BY_PLAYER_COUNT,
  JAPAN_NON_PARTICIPANT_PENALTY,
  LONGEST_PATH_BONUS,
  ROUTE_SCORES,
  UNUSED_STATION_POINTS,
} from './routeScores.js'
import { GAME_VERSIONS } from './gameVersions.js'

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

function getJapanBulletTable(playerCount) {
  if (JAPAN_BULLET_TRAIN_BONUS_BY_PLAYER_COUNT[playerCount]) {
    return JAPAN_BULLET_TRAIN_BONUS_BY_PLAYER_COUNT[playerCount]
  }

  if (playerCount < 2) {
    return JAPAN_BULLET_TRAIN_BONUS_BY_PLAYER_COUNT[2]
  }

  return JAPAN_BULLET_TRAIN_BONUS_BY_PLAYER_COUNT[5]
}

function calculateJapanBulletBonuses(players) {
  const bulletTable = getJapanBulletTable(players.length)
  const participatingPlayers = players
    .filter((player) => normalizeNumber(player.bulletTrainProgress) > 0)
    .sort((leftPlayer, rightPlayer) => normalizeNumber(rightPlayer.bulletTrainProgress) - normalizeNumber(leftPlayer.bulletTrainProgress))

  const bonuses = new Map()
  let rank = 1
  let index = 0

  while (index < participatingPlayers.length) {
    const currentProgress = normalizeNumber(participatingPlayers[index].bulletTrainProgress)
    const tiedPlayers = participatingPlayers.filter((player) => normalizeNumber(player.bulletTrainProgress) === currentProgress)
    const rankPoints = bulletTable[rank - 1] ?? bulletTable[bulletTable.length - 1]

    tiedPlayers.forEach((player) => {
      bonuses.set(player.id, rankPoints)
    })

    index += tiedPlayers.length
    rank += tiedPlayers.length
  }

  players.forEach((player) => {
    if (!bonuses.has(player.id)) {
      bonuses.set(player.id, JAPAN_NON_PARTICIPANT_PENALTY)
    }
  })

  return bonuses
}

export function getItalyRegionBonusForCount(regions) {
  const normalizedRegions = normalizeNumber(regions)

  if (normalizedRegions < 5) {
    return 0
  }

  if (normalizedRegions >= 15) {
    return ITALY_REGION_BONUS[15]
  }

  return ITALY_REGION_BONUS[normalizedRegions] ?? 0
}

function calculateItalyRegionBonus(italyNetworks) {
  return italyNetworks.reduce((total, network) => {
    return total + getItalyRegionBonusForCount(network.regions)
  }, 0)
}

export function calculateFinalScore(player, context = {}) {
  const routeScore = calculateRouteScore(player.routeCounts)
  const ticketScore = calculateTicketScore(player.tickets)
  const gameVersion = context.gameVersion ?? GAME_VERSIONS.EUROPE
  const players = context.players ?? [player]

  if (gameVersion === GAME_VERSIONS.JAPAN) {
    const bulletBonuses = calculateJapanBulletBonuses(players)
    const bulletTrainBonus = bulletBonuses.get(player.id) ?? JAPAN_NON_PARTICIPANT_PENALTY
    const bulletTrainTrack = normalizeNumber(player.bulletTrainProgress)

    return {
      routeScore,
      ticketScore,
      bonusScore: bulletTrainBonus,
      extraScore: bulletTrainTrack,
      totalScore: routeScore + ticketScore + bulletTrainBonus,
      completedTickets: player.tickets.filter((ticket) => ticket.completed).length,
      failedTickets: player.tickets.filter((ticket) => !ticket.completed).length,
    }
  }

  if (gameVersion === GAME_VERSIONS.ITALY) {
    const regionsBonus = calculateItalyRegionBonus(player.italyNetworks ?? [])

    return {
      routeScore,
      ticketScore,
      bonusScore: regionsBonus,
      extraScore: 0,
      totalScore: routeScore + ticketScore + regionsBonus,
      completedTickets: player.tickets.filter((ticket) => ticket.completed).length,
      failedTickets: player.tickets.filter((ticket) => !ticket.completed).length,
    }
  }

  const longestPathBonus = player.longestPath ? LONGEST_PATH_BONUS : 0
  const stationScore = normalizeNumber(player.unusedStations) * UNUSED_STATION_POINTS

  return {
    routeScore,
    ticketScore,
    bonusScore: longestPathBonus,
    extraScore: stationScore,
    totalScore: routeScore + ticketScore + longestPathBonus + stationScore,
    completedTickets: player.tickets.filter((ticket) => ticket.completed).length,
    failedTickets: player.tickets.filter((ticket) => !ticket.completed).length,
  }
}

function compareEuropePlayers(leftScore, rightScore, leftPlayer, rightPlayer) {
  if (leftScore.totalScore !== rightScore.totalScore) {
    return rightScore.totalScore - leftScore.totalScore
  }

  if (leftScore.completedTickets !== rightScore.completedTickets) {
    return rightScore.completedTickets - leftScore.completedTickets
  }

  if (normalizeNumber(leftPlayer.unusedStations) !== normalizeNumber(rightPlayer.unusedStations)) {
    return normalizeNumber(rightPlayer.unusedStations) - normalizeNumber(leftPlayer.unusedStations)
  }

  if (Boolean(leftPlayer.longestPath) !== Boolean(rightPlayer.longestPath)) {
    return Number(Boolean(rightPlayer.longestPath)) - Number(Boolean(leftPlayer.longestPath))
  }

  return 0
}

function compareJapanPlayers(leftScore, rightScore) {
  if (leftScore.totalScore !== rightScore.totalScore) {
    return rightScore.totalScore - leftScore.totalScore
  }

  if (leftScore.completedTickets !== rightScore.completedTickets) {
    return rightScore.completedTickets - leftScore.completedTickets
  }

  return 0
}

function compareItalyPlayers(leftScore, rightScore) {
  if (leftScore.totalScore !== rightScore.totalScore) {
    return rightScore.totalScore - leftScore.totalScore
  }

  if (leftScore.completedTickets !== rightScore.completedTickets) {
    return rightScore.completedTickets - leftScore.completedTickets
  }

  return 0
}

export function rankPlayers(players, gameVersion) {
  const playersWithScores = players.map((player) => ({
    player,
    score: calculateFinalScore(player, { gameVersion, players }),
  }))

  return playersWithScores.sort((leftEntry, rightEntry) => {
    if (gameVersion === GAME_VERSIONS.JAPAN) {
      return compareJapanPlayers(leftEntry.score, rightEntry.score)
    }

    if (gameVersion === GAME_VERSIONS.ITALY) {
      return compareItalyPlayers(leftEntry.score, rightEntry.score)
    }

    return compareEuropePlayers(leftEntry.score, rightEntry.score, leftEntry.player, rightEntry.player)
  })
}

export function getWinningPlayers(players, gameVersion) {
  const ranking = rankPlayers(players, gameVersion)

  if (ranking.length === 0) {
    return []
  }

  const [firstEntry] = ranking

  return ranking.filter((entry) => {
    if (gameVersion === GAME_VERSIONS.JAPAN) {
      return compareJapanPlayers(entry.score, firstEntry.score) === 0
    }

    if (gameVersion === GAME_VERSIONS.ITALY) {
      return compareItalyPlayers(entry.score, firstEntry.score) === 0
    }

    return compareEuropePlayers(entry.score, firstEntry.score, entry.player, firstEntry.player) === 0
  })
}