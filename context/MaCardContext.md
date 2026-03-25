### Overview
**Project:** Ckrit MaCard — interactive 52‑card game  
**Owner / Developer:** Jabulani Mdluli  
**Goal:** Build a cross‑platform, real‑time card game supporting Practice (offline), Reality (online multiplayer), and Corner (local network/Bluetooth) modes. Use **SVG** for cards/backgrounds (PNG/JPG allowed for optional uploads). Provide deterministic game rules, smooth animations, and token‑based wagering between **Dealer** and **Challenger**.

---

### Architecture and high‑level design
#### System summary
- **Client(s):** Web (desktop + mobile responsive) and optional native wrappers (Electron / Capacitor) for Bluetooth/AP hotspot features.  
- **Server:** Real‑time game server (WebSocket / WebRTC signaling) + REST API for account, matchmaking, and persistence.  
- **Data stores:** Relational DB for users/games; in‑memory store (Redis) for live game state and leaderboards; object storage for uploaded images.  
- **Realtime layer:** WebSocket (primary) with fallback to long polling; optional WebRTC for peer‑to‑peer Corner mode.  
- **Security:** Auth (JWT + refresh tokens), TLS everywhere, rate limits, server‑side validation of all game actions.

#### Tech stack recommendation (concise)
| Layer | Recommended | Rationale |
|---|---:|---|
| Frontend | **React** + TypeScript; SVG rendering via inline SVG | Fast dev, strong ecosystem, good animation libs |
| Realtime | **Socket.IO** or **ws** (Node) | Simple WebSocket patterns; fallback support |
| Backend | **Node.js (NestJS/Express)** or **Go** | Node for rapid iteration; Go for high concurrency |
| DB | **Postgres** | ACID for tokens, game history |
| Cache | **Redis** | Live game state, locks, pub/sub |
| Storage | **S3-compatible** | Store uploaded PNG/JPG assets |
| CI/CD | **GitHub Actions** | Automated builds, tests, deployments |

---

### Frontend, UI/UX and assets
#### Layout & visual rules
- **Viewport split:** Top half = **DEALER area**; Bottom half = **CHALLENGER area**. Central deck and discard/slots visible.  
- **Card assets:** 52 SVG card faces + 1 SVG back; background SVGs per table theme; allow optional PNG/JPG uploads (server stores and serves).  
- **Animations:** CSS + requestAnimationFrame for dealing; allow **speed control** (normal / fast / instant). Use GPU‑accelerated transforms for smoothness.

#### Key UI components
- **Lobby:** Create/Join game, Practice, Corner options, token selection.  
- **Game table:** Deck stack, visible slots (top/bottom/center), token wager UI, action buttons (SmallTop, SmallBottom, SmallCenter, Shuffle), Deal button (Dealer), Request UI (Challenger).  
- **Observers:** Watch mode overlay with WIN/LOSS buttons for intervention.  
- **Controls:** Shuffle timer indicator (2–3s auto shuffle), animation speed control, pause/resume.

#### UX rules & flows
- **Pre‑game:** Dealer & Challenger agree token amount; both confirm.  
- **Deal loop:** Dealer auto‑shuffles every 2–3s until Challenger issues a Request. Dealer must execute one request at a time.  
- **Request types:** SmallTop, SmallBottom, SmallCenter, Shuffle, RequestedCard. Each request triggers deterministic server logic and animation.  
- **Win condition:** If a dealt card lands in top half → Dealer wins; bottom half → Challenger wins. Server determines final outcome and awards tokens.

---

### Backend, game logic, APIs and data models
#### Core game loop (server authoritative)
1. **Shuffle timer:** Server triggers shuffle every 2–3s while in Deal Mode.  
2. **Request handling:** When Challenger sends a Request, server validates and enqueues it; Dealer must execute next request.  
3. **Deal action:** Dealer deals one card at a time from deck to table; server computes landing slot (top/bottom/center) and resolves winner.  
4. **Token settlement:** Server updates balances atomically in DB; emits events to clients.

#### Deterministic randomness & fairness
- Use **server‑side RNG** with optional seed logging per game for auditability. Record shuffle seeds and actions in game history for dispute resolution.

#### Data models (simplified)
```json
{
  "User": {"id":"uuid","username":"string","balance":"int"},
  "Game": {"id":"uuid","mode":"practice|reality|corner","state":"waiting|active|finished","stake":"int","created_at":"datetime"},
  "DeckState": {"game_id":"uuid","cards":["array of card ids"],"seed":"string"},
  "ActionLog": {"game_id":"uuid","actor":"user_id","action":"string","payload":"json","timestamp":"datetime"}
}
```

#### API endpoints (examples)
- `POST /api/games` — create game (mode, stake, options)  
- `POST /api/games/:id/join` — join game  
- `POST /api/games/:id/request` — challenger request (SmallTop/SmallBottom/SmallCenter/Shuffle/RequestedCard)  
- `POST /api/games/:id/deal` — dealer deals next card (server validates turn)  
- `GET /api/games/:id/state` — fetch current game snapshot  
- WebSocket channel: `game:{id}` — events: `state_update`, `action_executed`, `shuffle`, `deal_result`, `settlement`

#### Corner mode (local)
- **Peer discovery:** mDNS or Bluetooth LE advertising for local games.  
- **P2P:** Use WebRTC data channels for direct state sync; elect one peer as authoritative or use a local host device as temporary server. Persist final results to server when online.

---

### DevOps, deployment, security & monitoring
#### Deployment model
- **Staging** and **Production** clusters. Containerize backend (Docker). Use managed Postgres and Redis. Deploy via Kubernetes or serverless containers (e.g., AWS Fargate). Use CDN for static assets (SVGs, images).

#### CI/CD
- **Pipeline:** Lint → Unit tests → Integration tests → Build → Deploy to staging → E2E tests → Deploy to production.  
- **Feature flags** for toggling Corner/Reality features.

#### Security & compliance
- **Auth:** OAuth2 / JWT; secure refresh tokens.  
- **Validation:** Server‑side validation of every action; anti‑cheat checks (replay protection, action rate limits).  
- **Encryption:** TLS for all transport; encrypt sensitive data at rest.  
- **Privacy:** Minimal PII; store only necessary user info.

#### Monitoring & analytics
- Real‑time metrics: active games, latency, error rates.  
- Game analytics: win rates, shuffle counts, average game length, token flow. Use Prometheus + Grafana or managed alternatives.

---

### Roadmap, milestones, testing and QA
#### Phased milestones (recommended)
1. **MVP (4–6 weeks)**  
   - Single‑player Practice mode (Deal Mode + Challenger Mode offline)  
   - SVG card rendering, basic animations, local deck logic, speed control  
   - Unit tests for deck operations
2. **Multiplayer Reality (6–8 weeks)**  
   - Server, WebSocket real‑time play, token staking, lobby, matchmaking  
   - Server authoritative game loop, persistence, basic anti‑cheat  
3. **Corner mode & native wrappers (4–6 weeks)**  
   - Local discovery (mDNS/Bluetooth), P2P sync, offline host mode  
4. **Polish & scale (ongoing)**  
   - UI polish, accessibility, analytics, load testing, security audit

#### Testing plan
- **Unit tests:** Deck operations, shuffle determinism, token settlement.  
- **Integration tests:** API + DB flows, WebSocket message sequences.  
- **E2E tests:** Simulate full games (Dealer/Challenger/Observer).  
- **Load tests:** Simulate concurrent games and connection churn.  
- **Manual QA:** Visual checks for SVG rendering, animation smoothness, mobile responsiveness.

#### Acceptance criteria (MVP)
- 52 SVG cards render correctly; shuffle and deal animations run at 60fps on modern devices.  
- Dealer and Challenger can agree stake and complete a full game with correct token settlement.  
- Server logs deterministic seeds for every shuffle; no client can unilaterally alter outcome.