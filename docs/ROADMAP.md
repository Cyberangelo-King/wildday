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
