import { LONGEST_PATH_BONUS, ROUTE_SCORES, UNUSED_STATION_POINTS } from '../game/routeScores.js'

function buildRouteInputs() {
  return Object.entries(ROUTE_SCORES)
    .map(
      ([length, points]) => `
        <label class="route-card" for="route-${length}">
          <span class="route-card__length">Route ${length}</span>
          <span class="route-card__points">${points} pts</span>
          <input id="route-${length}" name="route-${length}" type="number" min="0" value="0" data-route-length="${length}" />
        </label>
      `,
    )
    .join('')
}

export function createAppTemplate() {
  return `
    <div class="page-shell">
      <header class="hero-block">
        <p class="eyebrow">Ticket to Ride: Classic</p>
        <h1>Final Score Calculator</h1>
        <p class="hero-copy">
          Scores classic endgame rules: routes, destination tickets, and the longest continuous path bonus.
        </p>
      </header>

      <section class="panel players-panel">
        <div class="players-panel__header">
          <div>
            <h2>Players</h2>
            <p>Add players one by one, switch back anytime, and keep editing their scores.</p>
          </div>
          <div class="players-panel__actions">
            <button class="button button--ghost" id="new-game-button" type="button">New Game</button>
            <button class="button" id="add-player-button" type="button">Add Next Player</button>
          </div>
        </div>

        <div class="player-editor">
          <label class="player-editor__name" for="player-name">
            <span>Current Player Name</span>
            <input id="player-name" name="playerName" type="text" maxlength="40" placeholder="Player name" />
          </label>
          <p class="player-editor__meta" id="current-player-meta">Editing Player 1</p>
        </div>

        <div class="player-switcher">
          <div class="player-switcher__head">
            <h3>Turn Order</h3>
            <p id="player-count">1 player</p>
          </div>
          <div class="player-chip-list" id="player-list"></div>
        </div>
      </section>

      <main class="layout-grid">
        <section class="panel">
          <div class="panel__header">
            <h2>Routes</h2>
            <p>Enter how many routes of each length were completed.</p>
          </div>
          <div class="route-grid">
            ${buildRouteInputs()}
          </div>
        </section>

        <section class="panel panel--accent">
          <div class="panel__header">
            <h2>Destination Tickets</h2>
            <p>Completed tickets add points, failed tickets subtract points.</p>
          </div>

          <form class="ticket-form" id="ticket-form">
            <label>
              <span>Name</span>
              <input id="ticket-name" name="ticketName" type="text" maxlength="60" placeholder="For example, Paris - Moskva" />
            </label>
            <label>
              <span>Points</span>
              <input id="ticket-points" name="ticketPoints" type="number" min="0" placeholder="0" required />
            </label>
            <label>
              <span>Status</span>
              <select id="ticket-status" name="ticketStatus">
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </label>
            <button class="button" type="submit">Add Ticket</button>
          </form>

          <div class="ticket-list-block">
            <div class="ticket-list-block__head">
              <h3>Ticket List</h3>
              <p id="ticket-empty-state">No tickets added yet.</p>
            </div>
            <ul id="ticket-list" class="ticket-list"></ul>
          </div>
        </section>

        <section class="panel panel--narrow">
          <div class="panel__header">
            <h2>Bonus</h2>
            <p>Optional bonus inputs, including unused stations at ${UNUSED_STATION_POINTS} points each.</p>
          </div>

          <label class="station-input" for="unused-stations">
            <span>Unused Stations</span>
            <input id="unused-stations" type="number" min="0" max="3" value="0" />
            <p>Use this only if you want to include the Europe station rule.</p>
          </label>

          <label class="toggle-row" for="longest-path">
            <div>
              <strong>Longest Path</strong>
              <p>Add the ${LONGEST_PATH_BONUS}-point bonus.</p>
            </div>
            <input id="longest-path" type="checkbox" />
          </label>

          <button class="button button--ghost" id="reset-button" type="button">Reset Current Player</button>
        </section>

        <section class="panel score-panel">
          <div class="panel__header">
            <h2>Summary</h2>
            <p>Final score breakdown across all classic scoring rules.</p>
          </div>

          <div class="score-stack">
            <div class="score-row">
              <span>Route Points</span>
              <strong id="route-score">0</strong>
            </div>
            <div class="score-row">
              <span>Ticket Points</span>
              <strong id="ticket-score">0</strong>
            </div>
            <div class="score-row">
              <span>Longest Path Bonus</span>
              <strong id="bonus-score">0</strong>
            </div>
            <div class="score-row">
              <span>Unused Stations</span>
              <strong id="station-score">0</strong>
            </div>
            <div class="score-row score-row--total">
              <span>Final Score</span>
              <strong id="total-score">0</strong>
            </div>
          </div>

          <div class="summary-note" id="ticket-summary">0 completed, 0 failed.</div>
        </section>
      </main>

      <section class="panel standings-panel">
        <div class="panel__header">
          <h2>Scoreboard</h2>
          <p>Compare all players and jump back into any score sheet for edits.</p>
        </div>

        <div class="winner-banner" id="winner-banner">
          <span class="winner-banner__label">Winner</span>
          <strong id="winner-name">Player 1</strong>
          <p id="winner-meta">Leading with 0 points.</p>
        </div>

        <div class="table-wrap">
          <table class="standings-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Route</th>
                <th>Tickets</th>
                <th>Bonus</th>
                <th>Stations</th>
                <th>Total</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody id="standings-body"></tbody>
          </table>
        </div>
      </section>
    </div>
  `
}