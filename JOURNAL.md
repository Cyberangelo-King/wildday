# Wildday build journal

## 2026-09-27 — Project start

- **Name:** Wildday.
- **Vision:** a customizable personal momentum system for goals, routines, focus, challenges, reminders, life events, and progress.
- **Product decision:** center the experience on a loop from what matters → a repeatable system → today's next action → a useful reflection.
- **Scope decision:** begin with goals, repeatable actions, a Today view, focus timer, local reminders, and weekly adjustment. Defer widgets, calendars, soundscapes, and adaptive recommendations until the core is useful.
- **Technical direction:** provisional React Native + Expo + TypeScript; local-first for the first useful release.
- **Next:** choose the visual direction and prototype the first mobile flow.

## 2026-09-28 — First mobile foundation

- Created `build/mobile-foundation` from `main` so the first implementation can be reviewed independently.
- Added the Expo + React Native + TypeScript application foundation with Expo Router.
- Added a local-first state layer using AsyncStorage; there is no account or network dependency in the core flow.
- Built the first-day setup: choose one meaningful goal, define its smallest repeatable move, and set an approximate duration.
- Built the first Today screen around one clear next move, completion, rescheduling, and a small amount of context.
- Kept the visual system deliberately provisional. Theme tokens live separately from product state so the product can take a stronger visual direction without a structural rewrite.
- Next: choose the visual language, then build goals/actions management and the focus-session loop.
