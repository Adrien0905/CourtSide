# ÉTAT ACTUEL DU PROJET (Pré-Phase 3)

## 1. Diagnostic Technique Actuel
- **Ce qui fonctionne :** L'interface React (Vite) est en place, le serveur Express local tourne, et le script de lancement fonctionne.
- **Le bug critique à corriger :** Actuellement, les données (prospects, formulaires, rapports) s'enregistrent à tort dans le `localStorage` du navigateur. Elles sont volatiles.
- **L'objectif immédiat :** Brancher définitivement le frontend React sur l'API Express pour que chaque action (création, édition, suppression) lise et écrive **uniquement et automatiquement** dans la base de données locale SQLite (`data/courtside.db`).

---

## 2. INSTRUCTION POUR L'IA (Prompt Phase 3)

*Applique les modifications suivantes au projet pour passer à la Phase 3 :*

Phase 3 Implementation: Streamlined Navigation, Analytics, Draft Board & 4-Level Confidence Scale

Please update COURTSIDE to Phase 3 with the following features, UI streamlining, and form refinements, keeping the dark sports-analytics visual identity and SQLite backend:

1. SIDEBAR NAVIGATION STREAMLINING:
- Remove "Scouting Reports", "Game Log", and "Video Library" from the main left sidebar navigation.
- Keep only: Dashboard, Player Database, My Draft Board, Player Comparison, and Settings & Data.
- Ensure all video breakdowns, game logs, and scouting reports remain fully accessible as sub-tabs inside each prospect's Player Dossier view.

2. CONFIDENCE SCALE SIMPLIFICATION:
- Update the Confidence Level dropdown in the Scouting Report form to a 4-level scale:
  1 - Initial Impression (Highlights / Quick cutups)
  2 - Single Game (Full film / Showcase)
  3 - Multi-Game (Multiple full films)
  4 - Deep Evaluation (Live + Full film)

3. RADAR CHARTS & COMPARISON ENGINE:
- Integrate visual radar charts (using Recharts or Chart.js) on the Player Dossier to display category ratings (Physical, Offense, Defense, B-Ball IQ, Mentality).
- In the "Player Comparison" view, allow selecting 2 prospects side-by-side with overlaid radar charts and stat differential highlights.

4. INTERACTIVE DRAFT BOARD WITH TIERS:
- Upgrade "My Draft Board" to support personal rankings organized into custom Tiers (Tier 1, Tier 2, Tier 3, etc.).
- Allow reordering prospects via drag-and-drop or quick rank buttons.
- Ensure all board positions are strictly personal evaluations with zero auto-generated consensus rankings.

5. DATABASE FILTERING & SEARCH:
- Enhance the Player Database view with filters for Position (PG/SG/SF/PF/C), Grade Ranges, and League (NCAA D1 / NBA G League).

6. PURE AUTOMATIC SQLITE PERSISTENCE (NO IMPORTS):
- Connect all frontend forms (creating/editing prospects, adding scouting reports, notes, draft board updates) directly to Express backend endpoints (`GET /api/prospects`, `POST`, `PUT`, `DELETE`) using `better-sqlite3`.
- Ensure all saved data immediately commits to `data/courtside.db`.
- On React application startup (`useEffect`), automatically fetch and display all existing records directly from SQLite.
- Ensure Vite proxy or CORS is configured so `/api` requests from `http://localhost:3000` work seamlessly without connection errors.