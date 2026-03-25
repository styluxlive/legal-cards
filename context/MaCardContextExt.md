### Overview
Below are three concrete deliverables to continue the project: **(1) a detailed API contract** (OpenAPI‑style summaries for core endpoints), **(2) a deterministic deck module pseudocode** (shuffle, cut, actions, dealing hooks), and **(3) a two‑sprint backlog** with tasks, estimates, and acceptance criteria for the MVP. Use these directly for implementation or to hand to engineers. Card Must match Rank Only Unless under Comming soon users that match even suits

---

### API Contract Summary
**Notes:** All endpoints require authentication (JWT). Server is authoritative for game state. Use JSON for payloads. WebSocket channel `game:{gameId}` emits real‑time events.

| **Method** | **Path** | **Purpose** | **Request Body** | **Response** |
|---|---:|---|---:|---|
| POST | /api/games | Create a new game | `{ "mode":"practice|reality|corner", "stake":int, "maxPlayers":2, "options":{...} }` | `{ "gameId":"uuid", "state":"waiting", "host":"userId" }` |
| POST | /api/games/:id/join | Join existing game | `{ "userId":"uuid" }` | `{ "gameId":"uuid", "players":[...], "state":"waiting" }` |
| POST | /api/games/:id/agree-stake | Both confirm stake | `{ "userId":"uuid", "stake":int }` | `{ "gameId":"uuid", "stake":int, "status":"confirmed|pending" }` |
| POST | /api/games/:id/request | Challenger request action | `{ "userId":"uuid","action":"SmallTop|SmallBottom|SmallCenter|Shuffle|RequestedCard","params":{...} }` | `{ "requestId":"uuid","status":"queued" }` |
| POST | /api/games/:id/deal | Dealer deals next card | `{ "userId":"uuid","speed":"normal|fast|instant" }` | `{ "dealId":"uuid","card":"AS","landing":"dealer|challenger|table","result":"pending|resolved" }` |
| GET | /api/games/:id/state | Snapshot of game | `-` | `{ "gameId":"uuid","deck":["..."],"slots":{...},"players":[...],"logs":[...] }` |
| POST | /api/games/:id/settle | Finalize token settlement | `{ "userId":"uuid","result":"dealer|challenger|draw" }` | `{ "settlementId":"uuid","balances":[{"userId":"uuid","balance":int}] }` |

#### Schemas and important fields
- **DeckState**
  - `cards`: array of card codes (e.g., `"AS","2H",...`) top of deck = index 0.
  - `seed`: string (hex) used for deterministic RNG.
  - `shuffleCount`: int.
- **ActionLog**
  - `actionId`, `actorId`, `actionType`, `params`, `seedBefore`, `seedAfter`, `timestamp`.
- **DealResult**
  - `card`, `fromIndex`, `toPosition` (`topHalf|bottomHalf|center`), `winner` (`dealer|challenger|none`), `animationId`.

#### Error handling
- Use standard HTTP codes. Include `errorCode` and `details` in body. Example: `409` for invalid turn, `422` for invalid request params.

---

### WebSocket Events and Message Flow
**Channel:** `game:{gameId}`

| **Event** | **Direction** | **Payload (summary)** |
|---|---:|---|
| state_update | server → clients | `{ "gameId","deckCount", "slots", "players", "turn" }` |
| request_queued | server → clients | `{ "requestId","actorId","action","params" }` |
| request_executed | server → clients | `{ "requestId","action","result","seedBefore","seedAfter" }` |
| shuffle | server → clients | `{ "seed","shuffleCount" }` |
| deal_result | server → clients | `{ "dealId","card","landing","winner","balances" }` |
| settlement | server → clients | `{ "settlementId","balances","logs" }` |
| error | server → clients | `{ "code","message" }` |

**Flow summary:** Challenger sends `request` via REST or WS → server validates and queues → Dealer triggers `deal` → server executes deck operations, emits `deal_result` → server updates DB and emits `settlement` when applicable.

---

### Deck Module Pseudocode
**Goals:** Deterministic shuffle with seed, efficient operations for SmallTop/Bottom/Center, atomic state updates, hooks for animation.

```pseudo
class Deck {
  cards: array[string]   // index 0 = top
  seed: int64
  rng: PRNG(seed)

  constructor(seed, cardsArray) {
    this.cards = copy(cardsArray)
    this.seed = seed
    this.rng = new PRNG(seed)
  }

  // Fisher-Yates deterministic shuffle using PRNG
  shuffle() {
    for i from cards.length - 1 down to 1:
      j = floor(rng.nextFloat() * (i + 1))
      swap(cards[i], cards[j])
    seed = rng.nextStateHex()
    return { seed, cardsSnapshot: copy(cards) }
  }

  // Take roughly quarter from top, random count among [3,5,7]
  smallTop() {
    count = randomChoice([3,5,7], rng)
    quarter = max(1, floor(cards.length / 4))
    take = min(count, quarter)
    taken = cards.splice(0, take)
    // put taken at bottom
    cards.push(...taken)
    return { taken, newDeck: copy(cards) }
  }

  // Take roughly quarter from bottom, random count among [3,5,7]
  smallBottom() {
    count = randomChoice([3,5,7], rng)
    quarter = max(1, floor(cards.length / 4))
    take = min(count, quarter)
    start = cards.length - take
    taken = cards.splice(start, take)
    // put taken at top
    cards.unshift(...taken)
    return { taken, newDeck: copy(cards) }
  }

  // Take from center, approximate center index
  smallCenter() {
    count = randomChoice([3,5,7], rng)
    quarter = max(1, floor(cards.length / 4))
    take = min(count, quarter)
    centerIndex = floor(cards.length / 2) - floor(take / 2)
    taken = cards.splice(centerIndex, take)
    // put taken at top
    cards.unshift(...taken)
    return { taken, newDeck: copy(cards) }
  }

  // Deal one card from top
  dealOne() {
    if cards.length == 0: throw Error("Deck empty")
    card = cards.shift()
    return card
  }

  // Deterministic random choice helper
  randomChoice(options, rng) {
    idx = floor(rng.nextFloat() * options.length)
    return options[idx]
  }
}
```

**PRNG recommendation:** Use a cryptographically secure deterministic PRNG like HMAC‑DRBG or Xorshift128+ seeded with server seed; store seed and state after each shuffle/action in `ActionLog`.

**Animation hooks**
- Each deck method returns `taken` and `newDeck` snapshots plus `seedBefore` and `seedAfter`. Server emits these to clients so clients can animate transitions exactly as server computed.

---

### Two Sprint Backlog for MVP
**Sprint length:** 2 weeks each. Team: 3 engineers (2 frontend, 1 backend), 1 designer, 1 QA.

#### Sprint 1 Goals
**Deliverables:** Practice mode single‑player; deck module; UI for table and controls; unit tests.

- **Task 1**: Implement Deck Module (shuffle, smallTop, smallBottom, smallCenter, dealOne).  
  - **Estimate:** 3 days  
  - **Acceptance:** Unit tests cover 95% of functions; deterministic shuffle reproducible with seed.

- **Task 2**: Build Game Table UI (React) with SVG card rendering and split viewport.  
  - **Estimate:** 4 days  
  - **Acceptance:** 52 SVG cards render; top/bottom halves visually distinct; responsive layout.

- **Task 3**: Implement Deal Loop and Animation Engine (client only).  
  - **Estimate:** 4 days  
  - **Acceptance:** Auto shuffle every 2–3s; deal animation 60fps on modern device; speed control works.

- **Task 4**: Local game logic glue (no server) to simulate Dealer/Challenger flows.  
  - **Estimate:** 2 days  
  - **Acceptance:** Player can set stake, start deal, challenger can issue requests; results resolved locally.

- **Task 5**: QA and polish; unit tests and basic E2E.  
  - **Estimate:** 1 day  
  - **Acceptance:** No critical bugs; animations smooth; tests pass.

#### Sprint 2 Goals
**Deliverables:** Server authoritative Reality mode basics; WebSocket; token settlement; lobby.

- **Task 1**: Backend skeleton (Node/NestJS) with DB models for User, Game, DeckState, ActionLog.  
  - **Estimate:** 3 days  
  - **Acceptance:** DB migrations run; basic CRUD for games.

- **Task 2**: Implement WebSocket game channel and server authoritative deck operations.  
  - **Estimate:** 4 days  
  - **Acceptance:** Server executes shuffle and actions; emits `deal_result` and `state_update`.

- **Task 3**: Token staking and settlement logic with atomic DB transactions.  
  - **Estimate:** 2 days  
  - **Acceptance:** Stakes reserved on join; settlement updates balances atomically.

- **Task 4**: Lobby UI and join/create flows; integrate with WebSocket.  
  - **Estimate:** 3 days  
  - **Acceptance:** Users can create/join games; both confirm stake; game transitions to active.

- **Task 5**: Integration tests, load test basic concurrency, QA.  
  - **Estimate:** 2 days  
  - **Acceptance:** Simulate 50 concurrent games; no data corruption; basic anti‑cheat checks in place.

---

### Next Steps
- **Immediate:** Integrate the deck module pseudocode into backend and add unit tests for deterministic behavior.  
- **Parallel:** Designer to produce SVG card set and table backgrounds; frontend to wire animations to server events.  
- **Follow up deliverable I can produce now:** a full **OpenAPI YAML** for the endpoints above, or a **detailed server sequence diagram** for request → deal → settlement flows. I will proceed with the OpenAPI YAML next if you want it.