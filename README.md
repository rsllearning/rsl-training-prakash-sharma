# ShopCart — Modern Client-Side State Management in React

ShopCart is an interactive e-commerce cart and multi-step checkout application built with **React**, **TypeScript**, and **Vite**, backed by a local **json-server** mock REST API.

---

## 🌳 Repository Branching Structure
The project is organized in the following dependent branching tree:

```
master (React + Vite Boilerplate, Types, db.json, Proxy Config, UI Shell)
├─ deliverable-1-context (PR1 → base branch: master)
│
├─ deliverable-2-zustand (PR2 → base branch: master)
│   │
│   └─ deliverable-4-xstate (PR4 → base branch: deliverable-2-zustand)
│
└─ deliverable-3-jotai (PR3 → base branch: master)
```

---

## 🚀 Running the Project (Two-Terminal Execution)

Run the development environment using two separate terminal windows:

### Terminal 1: Frontend
```bash
npm run dev
```
Starts Vite dev server at [http://localhost:5173/](http://localhost:5173/).

### Terminal 2: Mock API (json-server)
```bash
npm run server
```
Starts json-server on [http://localhost:3001/](http://localhost:3001/) with an artificial 1.5-second network delay (`--delay 1500`).

---

## 🛠️ Verification & Build
To build and check TypeScript types across all branches:
```bash
npm run build
```

---

## 📦 Deliverables Summary

1. **`deliverable-1-context` (PR 1):** React built-in `useReducer` with split contexts (`CartStateContext`, `CartDispatchContext`) and custom safety-guarded consumer hooks.
2. **`deliverable-2-zustand` (PR 2):** Zustand store with derived selector computation, granular subscriptions preventing action button re-renders, and async checkout action.
3. **`deliverable-3-jotai` (PR 3):** Bottom-up atomic state model using Jotai atoms, dynamic derived atoms (`totalCountAtom`, `totalPriceAtom`), and action-only / value-only subscription hooks.
4. **`deliverable-4-xstate` (PR 4):** XState v5 Finite State Machine orchestrating multi-step checkout with declarative state transitions, guarded actions, native `AbortSignal` HTTP cancellation, and bidirectional store synchronization with Zustand.
