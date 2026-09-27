# Wildday roadmap

This roadmap is ordered around learning: validate the central behavior before adding features that create more setup, permissions, or maintenance.

## 0. Product foundation

- [x] Choose the working name and establish the repository.
- [x] Write the product promise, core loop, first-release boundary, and principles.
- [x] Record initial platform and privacy decisions.
- [ ] Choose one visual direction and turn it into a screen-level prototype.

## 1. First useful mobile build

- Create a lightweight onboarding and Today experience.
- Add goals and repeatable actions with an explicit next step.
- Persist data locally and make the primary flow work offline.
- Add a focus timer and user-configured local reminders.
- Add completion, rescheduling, and a weekly adjustment flow.
- Check accessibility and usability with a small set of real tasks.

**Exit signal:** a new person can set up one meaningful system, complete or reschedule an action, and understand what to do next without assistance.

## 2. Consistency and recovery

- Add flexible schedules, easier-day alternatives, pauses, and restart guidance.
- Add milestone celebrations and a personal progress history.
- Add daily, weekly, monthly, and custom challenges where they reinforce a goal.
- Tune reminder timing and frequency based on explicit user preferences.

**Exit signal:** the experience supports both a good week and a disrupted week without shaming or losing useful history.

## 3. Personal command center

- Add a configurable widget for today's next action and quick completion.
- Add birthdays, deadlines, and calendar integrations with narrow, explainable permissions.
- Add focus modes and optional ambience or rain sounds.
- Add backup, sync, and device migration with clear privacy controls.

**Exit signal:** Wildday is useful at a glance and reduces the need to check several separate tools.

## 4. Adaptive intelligence

- Offer explainable suggestions based on the person's own history and stated preferences.
- Detect overloaded plans and propose smaller, user-approved adjustments.
- Support cross-goal scheduling while preserving user choice and quiet hours.
- Evaluate suggestions for helpfulness, unwanted pressure, and accessibility.

**Exit signal:** suggestions measurably reduce planning friction without taking control away from the person.

## 5. Expand with evidence

Explore optional accountability partners, shared challenges, broader integrations, richer soundscapes, and additional personal systems only when user feedback shows a clear need.

## Current build — 2026-09-28

The first mobile foundation is now underway on `build/mobile-foundation`:

- Expo + React Native + TypeScript scaffold
- Expo Router navigation
- First-day onboarding
- Local-first action persistence
- Today view with a single next move
- Complete and reschedule interactions
- Theme tokens isolated from product state

The next implementation step is to expand the core loop into goals, repeatable actions, focus sessions, and weekly reflection after the visual direction is settled.
