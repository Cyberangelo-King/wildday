## 2026-09-28 — Direction chosen

The first prototype now treats Wildday as a **personal momentum instrument**, not a habit tracker. The interface deliberately avoids streak-heavy gamification and keeps metrics subordinate to action.

Implemented in the foundation branch:

- [x] First-day onboarding
- [x] Today / next-move surface
- [x] Goal → action creation
- [x] Local persistence
- [x] Complete / reschedule
- [x] Focus timer
- [x] Reflection surface
- [x] Initial visual language
- [x] TypeScript CI check
- [x] Date-aware recurring action history
- [x] User-visible cadence controls
- [x] Opt-in local daily reminders
- [x] Explicit selective sharing
- [x] Quick mental-note capture
- [x] Persistence recovery surface
- [x] Automated Expo configuration validation
- [x] Expo SDK dependency alignment

Next build pass:

- [ ] Proper action scheduling and recurring cadence
- [ ] Real weekly history rather than current-session aggregates
- [ ] Focus work/break cycles
- [ ] Local notification preferences and quiet hours
- [ ] Accessibility pass and reduced-motion behavior
- [ ] Empty/error/loading states
- [ ] Real-device validation on Android and iOS

## Next product principle

Wildday should treat interruption as a first-class state. A plan can be completed, deferred, skipped, or resumed without rewriting history. The next implementation should preserve this distinction while introducing date-aware occurrences so recurring actions become real rather than simulated.


## Reliability gate

Before release, the same validation commands used in CI must pass locally or in a development build:

- npm run typecheck
- npm run doctor
- npx expo config --type public

Native behaviour still requires real-device testing. In particular: notification permission flows, scheduled reminders, notification taps, focus timer background/foreground transitions, safe-area layouts, keyboard behaviour, and OS share sheets.
