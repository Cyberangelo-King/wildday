# Wildday

**Make every day count.**

Wildday is a personal momentum system: a place to turn the things you care about into goals, repeatable systems, and a clear next action—and to get back on track when life gets in the way.

The ambition is broad: focus sessions, routines, reminders, challenges, milestones, quiet and rain sounds, life events, and a home-screen widget. The product should feel like one coherent companion, not a pile of unrelated tools.

## Start here

- [Product brief](docs/PRODUCT.md): audience, principles, product loop, first release, and longer-term possibilities.
- [Roadmap](docs/ROADMAP.md): staged path from first useful build to a more capable personal system.
- [Technical decisions](docs/DECISIONS.md): initial platform choices and their trade-offs.
- [Build journal](JOURNAL.md): dated project notes and decisions.

## The first useful version

Start with a today view, a small set of goals and repeatable actions, a focus timer, gentle reminders, and a weekly reflection. Make it easy to set up, adapt, and restart. Add broader integrations and platform features after the core loop proves useful.

## Product principles

1. **Help me act, not just plan.** Every goal should lead to a concrete next step.
2. **Accountability without shame.** A missed day is information, not a reason to reset someone's progress to zero.
3. **Personal by default.** Let people shape routines, cadence, focus sessions, and reminders around their lives.
4. **One calm home for many life areas.** Keep the experience understandable as the product grows.
5. **Earn attention.** Notifications should be useful, chosen by the user, and easy to change.

## Status

The repository now contains the first mobile foundation: Expo + React Native + TypeScript, file-based routing, local persistence, and a first-day onboarding flow leading into Today.

The visual system is intentionally restrained: warm paper, deep ink, an acid-lime action signal, oversized type, generous spacing, and low visual noise. Theme tokens remain isolated so the interface can evolve without rewriting product logic.

The branch is still pre-release. TypeScript CI, real-device validation, accessibility review, persistence recovery, and notification behaviour are release gates.
