# Security

## Data boundary

Wildday is local-first. The first release does not require an account, remote database, analytics SDK, or push-token registration.

The device may contain:
- goals and action titles
- action cadence and completion history
- focus totals
- user-written reflections
- reminder preferences

These values are personal data. They are not sent to a Wildday server by the current application.

## Storage

The current persistence layer uses AsyncStorage for the local application state. This is an implementation choice for the first release, not a claim that AsyncStorage is encrypted storage.

Therefore:
- never store passwords, API keys, access tokens, payment data, or authentication secrets in app state
- never add third-party credentials to the repository
- keep reflection and goal content out of logs and crash payloads
- bound user-generated strings before persistence
- version and migrate persisted state rather than assuming the stored shape is current

A future release that handles substantially more sensitive data should evaluate encrypted storage or a platform-backed secure data layer before expanding the data model.

## Notifications

Reminders are local-only and opt-in.

Wildday must:
- request notification permission only after the user enables reminders
- avoid registering remote push tokens for local reminders
- avoid placing sensitive goal or reflection text into notification payloads
- provide a clear way to disable reminders
- keep notification behaviour deterministic and bounded

## Network boundary

The core loop should work without network access.

When future intelligence, sync, or integrations are introduced:
1. define exactly which data leaves the device
2. obtain explicit user consent where appropriate
3. minimize payloads
4. authenticate requests securely
5. never embed service credentials in the mobile bundle
6. document retention and deletion behaviour
7. add threat-model and abuse-case review before release

## Repository hygiene

- Secrets must never be committed.
- CI must not print credentials.
- Dependencies should remain aligned with the supported Expo SDK.
- Dependency health and TypeScript checks run in CI.
- Native permissions should be justified by a user-visible feature.

## Reporting

Security issues should be reported privately to the project maintainer rather than disclosed publicly first. Do not include real credentials or private personal data in an issue.
