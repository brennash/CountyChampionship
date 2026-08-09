# All-Ireland Inter-County Battle

A Hex Empire–style turn-based conquest game played across Ireland's 32 counties, with real county boundaries and one of four provinces to play as.

**Play it:** https://brennash.github.io/CountyChampionship/

## How to play

You are Leinster, facing three AI-controlled rivals — Ulster, Munster, and Connacht. Every county starts unclaimed except the four provincial capitals. Each turn you get up to three marches:

- Select one of your counties, then click a neighbouring county to march your army into it.
- Marching into a neutral or enemy county attacks it — win with a bigger army and you capture it; lose and your army is destroyed while the defenders are weakened.
- Marching into your own county reinforces it, and a county can be marched into any number of times in a turn, stacking its strength each time.
- A county can only play one role per turn: once it has been a *destination*, it can never march out as a *source*.
- Your turn ends automatically after three moves, or click "End Turn" to stop sooner.

Win by taking all 32 counties or eliminating every rival province.

## Development

```bash
npm install
npm run dev      # local dev server with hot reload
npm run build    # type-check and produce a production build in dist/
npm run preview  # preview the production build locally
```

Pushing to `main` builds and deploys automatically to GitHub Pages via the workflow in `.github/workflows/deploy.yml`.

## Project structure

- `src/data/` — the 32 counties, their adjacency, real boundary shapes (traced from an accurate source SVG), and the four provinces/players.
- `src/game/` — pure game state and turn logic (`engine.ts`), and the React reducer wrapping it (`reducer.ts`).
- `src/components/` — the map, sidebar, and UI pieces.
