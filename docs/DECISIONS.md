# Technical decisions

## D001 — Start with a cross-platform mobile codebase

**Status:** provisional

**Decision:** use React Native with Expo and TypeScript for the first mobile product, using Expo Router for navigation.

**Why:** the project is starting from an empty repository and needs to reach both iOS and Android. Expo documents a shared React Native navigation model for Android, iOS, and web, local and remote notification support, and an iOS widget library. This gives the team a productive starting point while retaining paths to native platform extensions.

**Trade-offs and checks:** iOS widgets run in an isolated extension runtime and have constraints. Exact-time Android alarms require additional platform permissions. Widgets, alarms, and background behavior must be proven on real platform builds; they should not be promised based on a simulator or web preview alone. Revisit this choice if native requirements become the dominant product risk.

**References:**

- [Expo Router](https://docs.expo.dev/versions/latest/sdk/router/)
- [Expo Widgets](https://docs.expo.dev/versions/latest/sdk/widgets/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Apple local notifications](https://developer.apple.com/documentation/usernotifications/scheduling-a-notification-locally-from-your-app)
- [Apple interactive widgets](https://developer.apple.com/documentation/widgetkit/adding-interactivity-to-widgets-and-live-activities)
- [Android app widgets](https://developer.android.com/develop/ui/views/appwidgets/overview)

## D002 — Keep the first experience local-first

**Status:** accepted for first release

**Decision:** the first useful flow should save to the device and remain usable offline. Defer accounts, cloud sync, and AI services until they solve an observed need.

**Why:** setup and daily follow-through should not depend on a network connection. Deferring accounts also avoids making sensitive personal goals leave the device before there is a clear user benefit.

## D003 — Treat notifications as user-controlled assistance

**Status:** accepted

**Decision:** notifications are optional, configurable, and limited by user-selected quiet periods. The app should request permission when the user enables a reminder, not as an unexplained first-run hurdle.

**Why:** reminders are central to the idea but can become intrusive. Permission should follow a clear, user-chosen benefit.

## D004 — Defer broad integrations until the core loop is proven

**Status:** accepted for first release

**Decision:** birthdays, calendar access, external alarms, and cross-device sync are later milestones.

**Why:** each integration adds setup, permissions, and platform-specific behavior. The first build should prove the goal → system → next action → reflection loop first.

