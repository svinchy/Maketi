# Maketi (maketi.ge)

Bilingual (Georgian `ka` / English `en`) marketing site for a **construction & renovation company** in Georgia. Built with **Symbols (`smbls`)** — UI is plain JS objects rendered by **DOMQL**. Uses **Three.js** for the 3D house model.

## Run it

```bash
npm run dev      # smbls start → http://localhost:1234  (livesync/hot-reload) ← THE REAL SERVER
```

- **Always use http://localhost:1234.** It runs the official Symbols pipeline, so what you see = production.
- Do NOT use any static `server.mjs` / port 4174 — it serves raw unbundled source, does NOT match production, and no hot-reload. If it reappears, ignore it.
- Livesync auto-refreshes on save — no manual browser refresh needed.
- **HouseEditor sandbox**: `node HouseEditor/serve.mjs` → http://localhost:4300/HouseEditor/ (launch config `house-editor`). The HouseEditor is being built standalone in `HouseEditor/` (plain HTML + vanilla Three.js from `node_modules`, no smbls) and gets mounted on the main page (`pages/main.js`, currently commented out) only when finished. This sandbox server is fine — the "no static server" rule below applies only to serving the main site.
- `npm run build` (`smbls runner build index.js`) produces `dist/index.html`. The audit preflight still reports existing DOMQL/framework violations, so use `npm run dev` for the production-like live preview and the build as a packaging check.

## Structure

- `components/` — reusable elements (Navbar, Logo, ServiceItem, HouseModelSection, BlackHouseShowcase, ChatButton, Form, etc.); `index.js` re-exports all.
- `sections/` — page sections (Banner, Services, Projects); `index.js` re-exports.
- `pages/` — `index.js` maps routes (`'/': main`, `/projects/*`), `main.js` = landing page, `projectPages.js` = project detail pages.
- `effects/` — vanilla-JS scroll/interaction effects (intro, services, 3D house); wired via component `onInit` + polling, since `index.js` top-level setup isn't run by `smbls start`.
- `designSystem/` — tokens: `spacing.js` (base 16, ratio 1.618), `typography.js` (base 16, ratio 1.25), color, theme, font, timing.
- `state.js` — bilingual translations (`ka`/`en`) + all site copy.
- `context.js` — assembles everything and is passed to `create(app, context)` in `index.js`.

## Conventions (DOMQL — enforced; violations fail silently)

- **PascalCase keys only.** Lowercase top-level child keys (`h1:`, `nav:`, `form:`) are filtered out and **never render**. Use `H1`, `Nav`, `Form`.
- **Tag auto-detected from the key** for built-ins (`P`, `H1`–`H6`, `Caption`, `Button`, `Img`, `Nav`…). Don't add redundant `tag:''`. Only set `tag` when the key doesn't imply it (custom names like `Navbar`, `Title`).
- **No raw px** — use scale letters. Typography (ratio 1.25): A=16, B=20, C=25, D=31, E=39, F=49, G=61, H=76, I=95, J=119, K=149, L=186, … P≈455. Spacing/boxSize uses ratio 1.618. Negative offsets: `'-C'`. Numbered suffixes (`A1`, `C2`) are sub-sequence half-steps.
- **Flat element API.** No nested `props:{}` / `on:{}`; reactive props are `(el, s) => …`. Vendor CSS props (e.g. `WebkitTextStroke`) go inside `style:{}`, else they're dropped.
- Effect/handler functions are eval'd **without module scope** — keep all helpers/consts inside the function.

## Audit

`npx smbls frank-audit .` lists rule violations. **Do NOT trust `--fix`** — it invents features / changes layout and its rollback can silently fail. Fix findings manually and verify on localhost:1234.

## Tooling

- **Symbols MCP** is connected (docs, rules, SDK, audit, codegen) — use it for framework questions.
- Deeper conventions & session preferences live in the memory files (`MEMORY.md`).
