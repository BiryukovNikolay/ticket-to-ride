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
        <p class="eyebrow" id="version-eyebrow">Ticket to Ride: Europe</p>
        <h1 id="hero-title">Europe Score Calculator</h1>
        <p class="hero-copy" id="hero-copy">
          Scores routes, destination tickets, unused stations, and the European Express longest route bonus.
        </p>
      </header>

      <section class="panel players-panel">
        <div class="players-panel__header">
          <div>
            <h2>Players</h2>
            <p>Add players one by one, switch back anytime, and keep editing their scores.</p>
          </div>
          <div class="players-panel__actions">
            <label class="version-picker" for="game-version">
              <span>Map Version</span>
              <select id="game-version">
                <option value="europe">Europe</option>
                <option value="japan">Japan</option>
                <option value="italy">Italy</option>
              </select>
            </label>
            <button class="button button--ghost" id="new-game-button" type="button">New Game</button>
            <button class="button" id="add-player-button" type="button">Add Next Player</button>
          </div>
        </div>
        <p class="players-panel__note" id="version-help-note">Switching version starts a fresh score sheet for the selected map.</p>

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
            <p id="route-description">Enter only your regular route claims. Ferries and tunnels still score by route length.</p>
          </div>
          <div class="route-grid">
            ${buildRouteInputs()}
          </div>
        </section>

        <section class="panel panel--accent">
          <div class="panel__header">
            <h2>Destination Tickets</h2>
            <p id="ticket-description">Completed tickets add points, failed tickets subtract points.</p>
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
            <h2 id="bonus-title">Europe Bonuses</h2>
            <p id="bonus-description">Europe uses the longest route bonus and ${UNUSED_STATION_POINTS} points for each unused station.</p>
          </div>

          <div id="europe-rules-section">
            <label class="station-input" id="europe-stations-field" for="unused-stations">
              <span>Unused Stations</span>
              <input id="unused-stations" type="number" min="0" max="3" value="0" />
              <p>Use this only for Ticket to Ride: Europe.</p>
            </label>

            <label class="toggle-row" id="longest-path-field" for="longest-path">
              <div>
                <strong id="bonus-toggle-title">Longest Route</strong>
                <p>Add the ${LONGEST_PATH_BONUS}-point bonus. Only one player can hold it at a time in Europe.</p>
              </div>
              <input id="longest-path" type="checkbox" />
            </label>
          </div>

          <div id="japan-rules-section" hidden>
            <label class="station-input" id="japan-bullet-field" for="bullet-train-progress">
              <span>Bullet Train Track Position</span>
              <input id="bullet-train-progress" type="number" min="0" value="0" />
              <p>Enter your final position on the shared Bullet Train Track. 0 means you did not participate and take -20.</p>
            </label>
          </div>

          <div id="italy-rules-section" hidden>
            <form class="italy-network-form" id="italy-network-form">
              <label class="station-input" for="italy-network-regions">
                <span>Regions in this network</span>
                <input id="italy-network-regions" type="number" min="0" max="17" value="0" placeholder="0" />
                <p>Add one connected network at a time. Example: if a network covers 9 regions, it scores 11 points.</p>
              </label>
              <button class="button" type="submit">Add Network</button>
            </form>

            <div class="ticket-list-block italy-network-list-block">
              <div class="ticket-list-block__head">
                <h3>Region Networks</h3>
                <p id="italy-network-empty-state">No region networks added yet.</p>
              </div>
              <ul id="italy-network-list" class="ticket-list"></ul>
            </div>
          </div>

          <button class="button button--ghost" id="reset-button" type="button">Reset Current Player</button>
        </section>

        <section class="panel score-panel">
          <div class="panel__header">
            <h2>Summary</h2>
            <p id="summary-description">Final score breakdown across all active scoring rules for this map.</p>
          </div>

          <div class="score-stack">
            <div class="score-row">
              <span id="route-score-label">Route Points</span>
              <strong id="route-score">0</strong>
            </div>
            <div class="score-row">
              <span id="ticket-score-label">Ticket Points</span>
              <strong id="ticket-score">0</strong>
            </div>
            <div class="score-row">
              <span id="bonus-score-label">Longest Route Bonus</span>
              <strong id="bonus-score">0</strong>
            </div>
            <div class="score-row" id="extra-score-row">
              <span id="extra-score-label">Unused Stations</span>
              <strong id="extra-score">0</strong>
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
          <span class="winner-banner__label" id="winner-label">Winner</span>
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
                <th id="standings-bonus-label">Longest</th>
                <th id="standings-extra-header"><span id="standings-extra-label">Stations</span></th>
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