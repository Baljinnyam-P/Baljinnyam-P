# PROJECT MAP — File-by-File Reference

> One sentence per file. Use this while reading the code so you always know what a file is for.
>
> **Backend root:** `Project26_backend/`
> **Frontend root:** `Project26_frontend/Project26-Front/src/`

---

## TABLE OF CONTENTS

1. [How to Own This Project](#how-to-own-this-project)
2. [Product Readiness Checklist](#product-readiness-checklist)
3. [Backend — Entry & Infrastructure](#backend--entry--infrastructure)
4. [Backend — Lambda: Auth](#backend--lambda-auth)
5. [Backend — Lambda: Profile](#backend--lambda-profile)
6. [Backend — Lambda: Goals](#backend--lambda-goals)
7. [Backend — Lambda: Goal Progress](#backend--lambda-goal-progress)
8. [Backend — Lambda: Day Summary](#backend--lambda-day-summary)
9. [Backend — Lambda: Routines](#backend--lambda-routines)
10. [Backend — Lambda: Real-Time & Stream Processors](#backend--lambda-real-time--stream-processors)
11. [Backend — Lambda: Scheduled Jobs](#backend--lambda-scheduled-jobs)
12. [Backend — Domain Logic](#backend--domain-logic)
13. [Backend — Services](#backend--services)
14. [Backend — Models](#backend--models)
15. [Backend — Utilities](#backend--utilities)
16. [Backend — Tests](#backend--tests)
17. [Backend — Data Files](#backend--data-files)
18. [Frontend — App Screens](#frontend--app-screens)
19. [Frontend — Goals Feature](#frontend--goals-feature)
20. [Frontend — Goal Progress Feature](#frontend--goal-progress-feature)
21. [Frontend — Day Summary Feature](#frontend--day-summary-feature)
22. [Frontend — Day Story Feature](#frontend--day-story-feature)
23. [Frontend — Routines Feature](#frontend--routines-feature)
24. [Frontend — Profile Feature](#frontend--profile-feature)
25. [Frontend — Auth Feature](#frontend--auth-feature)
26. [Frontend — Notifications Feature](#frontend--notifications-feature)
27. [Frontend — Shared Components](#frontend--shared-components)
28. [Frontend — Providers, Stores & Infrastructure](#frontend--providers-stores--infrastructure)
29. [Frontend — Services & API](#frontend--services--api)
30. [Frontend — Config & Theme](#frontend--config--theme)
31. [Frontend — Utils](#frontend--utils)
32. [Frontend — Constants & i18n](#frontend--constants--i18n)
33. [Root Documentation Files](#root-documentation-files)

---

## How to Own This Project

> You don't need to understand 200 files at once. Follow this order and you'll understand everything.

### Step 1 — Read These 3 Files First (The Brain)

| File                          | Why                                                                                                                                                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain/GoalEvaluator.ts`     | Pure business logic — no AWS, no async. Start here to understand what the app _does_.                                                                                                                                                                                      |
| `services/ProgressService.ts` | The orchestrator — takes a progress update and drives everything: Evaluator → DDB TransactWrite → outbox event emission                                                                                                                                                   |
| `lib/self-project-stack.ts`   | The wiring — defines every Lambda, route, table, permission, and event source; includes 4 GSIs (`GSI1`, `GSI2`, `PublicRoutinesIndex`, `NotificationsEnabledIndex`), SQS FIFO pipelines, AppSync real-time API, DynamoDB Streams, and CloudWatch alarms |

### Step 2 — Understand the Data Model

There is **ONE DynamoDB table** called `UserGoals`. Everything is stored with:

```
PK = USER#{userId}       or    ROUTINE#{routineId}    or    SYSTEM
SK = {type}#{id}#{date}
```

Open `model/schemas.ts` — all entity shapes are defined there with Zod. Every item type you'll ever see in DDB is in that file.

### Step 3 — Trace One Request End-to-End

```
Frontend calls POST /v1/users/{userId}/goal/{goalId}/progress
  → API Gateway validates JWT via authorizer.ts
  → createGoalProgress.ts receives the event
  → ProgressService.ts loads prior state, checks idempotency
  → GoalEvaluator.ts computes streaks, achievements
  → DynamoDB TransactWrite: GOAL_PROGRESS + GOAL + DAY_SUMMARY + PROGRESS_EVENT (outbox)
  → DynamoDB Stream fires on INSERT PROGRESS_EVENT → progressEventProcessor.ts
  → Processor: writes activity log, fans out SQS messages to MemberSyncQueue
  → memberSyncConsumer.ts: writes snapshot, publishes AppSync mutation, updates leaderboard
  → Frontend receives AppSync subscription → UI updates in real time
  → DynamoDB Stream fires on INSERT ACHIEVEMENT → achievementNotification.ts
  → FCM push sent to the user for milestones
```

### Step 4 — Debug Bugs in Production

1. Go to **AWS CloudWatch → Log Groups**
2. Find `/aws/lambda/{lambdaName}` — the name matches the file name exactly
3. Filter by `ERROR` to see failures
4. Every Lambda logs its `event` as its first line — you can see what payload caused the error

### Step 5 — Deploy Yourself

```powershell
# From Project26_backend/
cdk deploy --profile project26-staging

# After deploy, copy the AppSync endpoint + API key from CDK output, then update:
# Project26_frontend/Project26-Front/src/config/config.prod.ts
# → Replace APPSYNC_URL and APPSYNC_API_KEY with the real values
```

---

## Product Readiness Checklist

### Complete and Shippable

| Feature                                                        | Status      |
| -------------------------------------------------------------- | ----------- |
| Google Sign-In                                                 | Complete |
| Apple Sign-In                                                  | Complete |
| Email/Password Sign-In & Sign-Up                               | Complete |
| Onboarding (goal template picker, timezone)                    | Complete |
| Goal CRUD (create / edit / archive / complete / delete)        | Complete |
| All 4 tracking types (boolean / counter / cumulative / timer)  | Complete |
| Retroactive edit window (current + previous ISO week)          | Complete |
| Streaks (daily + longest)                                      | Complete |
| Achievements / Trophy Room                                     | Complete |
| Day Summary (score, completion %, color)                       | Complete |
| Day Story Viewer (swipeable share cards)                       | Complete |
| Celebration Modal (milestone animations)                       | Complete |
| 365-day Progress Heatmap                                       | Complete |
| Daily reminder push notifications (15-min cron)                | Complete |
| HealthKit auto-sync (iOS)                                      | Complete |
| Health Connect auto-sync (Android)                             | Complete |
| Routine creation with goal blueprints                          | Complete |
| Routine joining via invite code (deep link)                    | Complete |
| Routine leaving / dissolving                                   | Complete |
| AppSync real-time member progress subscriptions                | Complete |
| Routine leaderboard (7-day fairness ranking)                   | Complete |
| Blueprint sync (owner updates propagate to member goal copies) | Complete |
| Profile photo upload (S3 + CloudFront CDN)                     | Complete |
| Data export (full JSON download)                               | Complete |
| Account deletion                                               | Complete |
| Privacy policy screen                                          | Complete |
| Dark mode                                                      | Complete |
| Error boundary (no white screen crashes)                       | Complete |
| Settings screen                                                | Complete |

### Pre-Launch Blockers

| #   | Issue                                                                          | File                             | Fix                                                                                                          |
| --- | ------------------------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | **Firebase env vars** must be set on Lambdas that call FCM                     | CDK stack environment config     | Verify `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` are set before deploying        |
| 2   | **Seed public routines** — Discover feed is empty until seeded                 | `scripts/seedPublicRoutines.ts`  | Run `GOALS_TABLE=UserGoals AWS_PROFILE=self npx ts-node scripts/seedPublicRoutines.ts` before any real users |
| 3   | **Verify `/v1/` routes post-deploy** — all API routes require the `/v1/` prefix | CDK stack + config files         | After `cdk deploy`, manually verify `GET /v1/users/{userId}/goals` → 200                                     |

### Deliberate Deferrals (Not Broken, Intentionally Skipped)

| Item                                    | Note                                                                                                                  |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `calendar.tsx` tab redirects to home    | The tab bar slot is reserved for a future calendar view. It hosts the center FAB button; tapping it doesn't navigate. |
| Discovery / follow graph                | Discover feed shows seeded public routines only. No user-driven discovery or follow graph yet.                        |
| Settings and Profile notification overlap | Both screens have notification toggles. Both write to the same profile field — can't desync.                        |
| Weekly group recap notifications        | Removed from the codebase. No EventBridge rule or Lambda exists for this feature.                                     |

---

## BACKEND — Entry & Infrastructure

> These files define how the backend is built and deployed.

| File                                         | What it does                                                                                                                                                                                                                        |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bin/self-project.ts`                        | CDK app entry point — instantiates `SelfProjectStack` and `SwaggerUIStack`                                                                                                                                                          |
| `lib/self-project-stack.ts`                  | Defines ALL infrastructure: 1 DynamoDB table (UserGoals) with 4 GSIs, 42 Lambda functions, HTTP API Gateway with 34 routes, AppSync GraphQL API for real-time subscriptions, 5 SQS queues (3 FIFO + DLQs), 1 EventBridge rule, S3 + CloudFront for avatars, and CloudWatch alarms |
| `lib/swagger-ui-stack.ts`                    | Deploys a public S3 bucket configured for static website hosting with the Swagger UI files                                                                                                                                           |
| `scripts/generate-openapi.ts`                | Exports the live OpenAPI spec from API Gateway, auto-registers Zod schemas as OpenAPI components, and applies endpoint metadata from `openapi-mapping.json`                                                                          |
| `scripts/seedPublicRoutines.ts`              | Idempotent one-shot script that seeds 3 public starter routines ("Morning Crew", "Fitness Grind", "Evening Wind-Down") into DynamoDB with invite codes                                                                               |
| `scripts/openapi-mapping.json`               | Config file mapping Lambda function names to OpenAPI paths with request/response schemas, tags, and summaries                                                                                                                        |
| `swagger-ui/openapi.json`                    | Machine-generated OpenAPI 3.0 spec — **do not edit by hand**, regenerate with the script                                                                                                                                            |
| `swagger-ui/swagger-ui.html`                 | HTML wrapper for the Swagger UI viewer                                                                                                                                                                                              |
| `swagger-ui/swagger-ui.css`                  | Swagger UI stylesheet                                                                                                                                                                                                               |
| `swagger-ui/swagger-ui-bundle.js`            | Swagger UI JavaScript bundle                                                                                                                                                                                                        |
| `swagger-ui/swagger-ui-standalone-preset.js` | Swagger UI standalone preset                                                                                                                                                                                                        |

**Notes:**

- Every Lambda is named after its file in `lambda/`. When a Lambda errors, its CloudWatch log group is `/aws/lambda/{filename-without-extension}`.
- There is **one DynamoDB table** (`UserGoals`). 
- `self-project-stack.ts` is long but organized by feature group — use Ctrl+F to find a feature's wiring.

---

## BACKEND — Lambda: Auth

> Handles sign-in, token validation, and onboarding completion.

| File                           | HTTP Route                                | What it does                                                                                                                                   |
| ------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `lambda/authorizer.ts`         | Lambda authorizer on all protected routes | Extracts a Bearer JWT from the Authorization header, verifies it using JWT_SECRET, validates the `sub` claim matches any `userId` path parameter (IDOR check), and returns an `isAuthorized` decision |
| `lambda/signInWithProvider.ts` | `POST /v1/auth/signin-provider`           | Verifies a Firebase ID token, finds or creates a user profile in DynamoDB by provider ID, updates timezone for returning users, and issues a 2-hour backend JWT |
| `lambda/completeOnboarding.ts` | `POST /v1/auth/onboarding/complete`       | Validates `selectedTemplateIds` (max 10), validates IANA timezone, and delegates to `OnboardingService.completeOnboarding` to create initial goals atomically |

**Notes:**

- All routes except `GET /v1/goalTemplates`, `GET /v1/routines/code/{code}`, `GET /v1/routines/discover`, and `POST /v1/auth/signin-provider` are protected by `authorizer.ts`.
- The JWT minted by `signInWithProvider.ts` is short-lived (2 hours). There is no refresh token mechanism — the client calls sign-in again on expiry.

---

## BACKEND — Lambda: Profile

> Manages the user's profile record in DynamoDB.

| File                      | HTTP Route                              | What it does                                                                                                            |
| ------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `lambda/createProfile.ts` | `POST /v1/users/{userId}`               | Validates the caller matches the path `userId`, parses body through `CreateProfileInputSchema` (Zod), and writes a new profile record to DynamoDB |
| `lambda/getProfile.ts`    | `GET /v1/users/{userId}`                | Verifies the authenticated caller matches the path `userId`, reads the user's profile from DynamoDB, and returns it (or 404) |
| `lambda/updateProfile.ts` | `PATCH /v1/users/{userId}`              | Validates the caller matches the path `userId`, parses body through `UpdateProfileInputSchema`, and performs an optimistic-concurrency update using client-supplied `updatedAt` |
| `lambda/deleteAccount.ts` | `POST /v1/users/{userId}/delete`        | Rate-limits to 3 attempts/day, cascades through all active routine memberships (dissolving owned routines, leaving others), then soft-deletes by setting `accountStatus = "deleted"` |
| `lambda/exportData.ts`    | `GET /v1/users/{userId}/export`         | Performs a paginated DynamoDB Query on the user's entire `USER#{userId}` partition, strips internal key attributes, groups items by `entityType`, and returns the full dataset as JSON |
| `lambda/getUploadUrl.ts`  | `POST /v1/users/{userId}/photo-upload-url` | Generates a pre-signed S3 PUT URL (5-minute expiry, Content-Type locked to `image/jpeg`) for uploading a user avatar, and returns both the upload URL and the corresponding CloudFront CDN URL |

**Notes:**

- Profile items use `PK = USER#{userId}`, `SK = PROFILE`.
- Soft deletion means DDB data is preserved. If you need to truly purge a user, you must manually delete all their items.
- `util/fcm.ts` detects stale FCM tokens and calls `updateProfile` to null them out automatically.

---

## BACKEND — Lambda: Goals

> CRUD operations for the user's personal goals.

| File                         | HTTP Route                                | What it does                                                                                                                                      |
| ---------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lambda/createGoal.ts`       | `POST /v1/users/{userId}/goals`           | Creates a `GOAL` item with Zod validation, enforces a 30-active-goal cap via a denormalized STATS record, supports `templateId` for preset goals, and performs `clientRequestId` idempotency dedup |
| `lambda/getGoal.ts`          | `GET /v1/users/{userId}/goals/{goalId}`   | Returns a single goal item by `userId` and `goalId` (or 404) |
| `lambda/getGoals.ts`         | `GET /v1/users/{userId}/goals`            | Fetches all goals (with optional `includeInactive` and `onlyArchived` params), looks up the user's timezone, and computes `effectiveStreak` and `isExpired` per goal using `GoalEvaluator` |
| `lambda/updateGoal.ts`       | `PATCH /v1/users/{userId}/goals/{goalId}` | Validates body through `UpdateGoalInputSchema`, blocks edits on completed goals (unless reactivating/archiving), performs optimistic-concurrency update, and recomputes today's DaySummary if behavioral fields changed |
| `lambda/getGoalTemplates.ts` | `GET /v1/goalTemplates` _(public, no auth)_ | Reads the bundled `goalTemplates.json` at cold-start, validates each template through `GoalTemplateSchema`, and returns the full list |

**Notes:**

- Goal items: `PK = USER#{userId}`, `SK = GOAL#{goalId}`.
- The 30-goal cap is enforced by counting active goals before inserting. Archived/completed goals don't count.
- `getGoalTemplates` is public (no authorizer) — used for app preview without sign-in.

---

## BACKEND — Lambda: Goal Progress

> Records, updates, and retrieves progress entries for individual goals.

| File                              | HTTP Route                                                | What it does                                                                                                                                                          |
| --------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lambda/createGoalProgress.ts`    | `POST /v1/users/{userId}/goal/{goalId}/progress`          | Creates today's progress entry by delegating to `ProgressService.upsertProgress`, supports `X-Idempotency-Key` header (returns existing record if found), uses `X-Timezone` for DaySummary recomputation |
| `lambda/updateGoalProgress.ts`    | `PATCH /v1/users/{userId}/goal/{goalId}/progress/{date}`  | Validates the date as YYYY-MM-DD, parses body through `UpdateGoalProgressInputSchema`, and delegates to `ProgressService.upsertProgress` for the given date |
| `lambda/getGoalProgress.ts`       | `GET /v1/users/{userId}/goal/{goalId}/progress`           | Requires `start_date` and `end_date` query params and returns all progress records for a single goal within that date range via a GSI query |
| `lambda/getGoalProgressByDate.ts` | `GET /v1/users/{userId}/goal/{goalId}/progress/{date}`    | Returns the progress entry for one specific goal and date (or 404) |
| `lambda/getBatchGoalProgress.ts`  | `GET /v1/users/{userId}/goal-progress`                    | Requires `start_date` and `end_date` params (validated as YYYY-MM-DD, start <= end) and returns progress for ALL goals in that range in a single query — used by the 365-day heatmap |
| `lambda/getDayProgress.ts`        | `GET /v1/users/{userId}/progress/{date}`                  | Returns all goal progress entries for the user on one specific day |

**Notes:**

- Progress items: `PK = USER#{userId}`, `SK = PROGRESS#DATE#{date}#GOAL#{goalId}`.
- `createGoalProgress` and `updateGoalProgress` both go through `ProgressService` — the logic is identical, only the DDB write mode differs.
- The edit window is enforced by `domain/editWindow.ts`: "2-weeks" covers the current and previous ISO week; "2-months" covers the current and previous calendar month.

---

## BACKEND — Lambda: Day Summary

> Aggregated daily completion views used in the heatmap and weekly review.

| File                        | HTTP Route                                                | What it does                                                                                                                |
| --------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `lambda/getDaySummary.ts`   | `GET /v1/users/{userId}/day-summary/{date}`               | Reads the pre-computed DaySummary for a date, and if none exists, triggers on-demand recomputation via `ProgressService.recomputeDaySummaryForDate` |
| `lambda/getDaySummaries.ts` | `GET /v1/users/{userId}/day-summary`                      | Requires `start_date` and `end_date` query params, enforces a max range of 365 days, and returns all DaySummary records in that range |

**Notes:**

- Day summary items: `PK = USER#{userId}`, `SK = DAY_SUMMARY#{date}`.
- Day summaries are written during the progress write pipeline (`ProgressService`), not computed on-demand (except the fallback in `getDaySummary`).
- The color field drives heatmap tile colors: `"none"` = gray, `"red"` = started, `"yellow"` = partial, `"green"` = complete, `"perfect"` = all goals + streak.

---

## BACKEND — Lambda: Routines

> Group goal tracking — users join a shared routine and see each other's progress live.

| File                              | HTTP Route                                      | What it does                                                                                                                                                                                                                     |
| --------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lambda/createRoutine.ts`         | `POST /v1/routines`                             | Parses the request body (with optional `clientRequestId` for dedup) and delegates to `RoutineService.createRoutine` to write the routine, blueprints, and member/participation records |
| `lambda/getRoutine.ts`            | `GET /v1/routines/{routineId}`                  | Verifies the caller is an active member, then returns routine metadata and the list of active members (userId, displayName, photoURL, role, joinedAt) |
| `lambda/getMyRoutines.ts`         | `GET /v1/users/{userId}/routines`               | Queries the caller's active memberships via GSI2, BatchGets routine metadata, inverts each member's `blueprintGoalMap`, and returns merged routines with role and join date |
| `lambda/getRoutineByCode.ts`      | `GET /v1/routines/code/{code}` _(public, no auth)_ | Looks up the invite code, checks expiration, and returns a safe public subset of the routine (name, description, icon, blueprints) without exposing members |
| `lambda/joinRoutine.ts`           | `POST /v1/routines/{routineId}/join`            | Validates body with `JoinRoutineInputSchema` and delegates to `RoutineService.joinRoutine` which creates membership/participation records and spawns personal goal copies — returns 201 for new joins or 200 if already joined |
| `lambda/leaveRoutine.ts`          | `POST /v1/routines/{routineId}/leave`           | Delegates to `RoutineService.leaveRoutine` to mark the caller's membership as inactive and perform cleanup, returning `{ left: true }` |
| `lambda/updateRoutine.ts`         | `PATCH /v1/routines/{routineId}`                | Authenticates the caller as the routine owner; either dissolves the routine via `routineService.dissolveRoutine` or applies metadata updates and syncs newly added blueprints to all existing members via SQS |
| `lambda/getRoutineProgress.ts`    | `GET /v1/routines/{routineId}/progress/{date}`  | Verifies membership, queries per-date normalized goal log slices for all active members, resolves blueprint-to-goal mappings, and returns per-member per-blueprint progress values |
| `lambda/getRoutineSnapshot.ts`    | `GET /v1/routines/{routineId}/snapshot/{date}`  | Verifies membership and returns a lighter response with only each member's achieved blueprint IDs and latest update timestamp — cheaper than `getRoutineProgress` |
| `lambda/getRoutineLeaderboard.ts` | `GET /v1/routines/{routineId}/leaderboard`      | Reads pre-computed weekly leaderboard rows from DynamoDB, calculates completion percentage per member based on blueprints times days elapsed in the current ISO week, and returns sorted rankings |
| `lambda/getRoutineActivity.ts`    | `GET /v1/routines/{routineId}/activity`         | Verifies membership, queries the most recent activity log items (newest first, optional `limit` param), batch-fetches member profiles, and returns the activity feed with merged displayName and photoURL |
| `lambda/getDiscoverRoutines.ts`   | `GET /v1/routines/discover` _(public, no auth)_ | Queries the `PublicRoutinesIndex` sparse GSI for up to 10 routines where `isPublicActive = "true"` and returns a safe public projection (name, description, icon, memberCount, inviteCode, goalCount) |

**Notes:**

- Routine items: `PK = ROUTINE#{routineId}`, `SK = ROUTINE_META`.
- Member items: `PK = ROUTINE#{routineId}`, `SK = MEMBER#{userId}`, with GSI2 for reverse lookups.
- Goal blueprints live on the routine item as a JSON array `blueprints[]`. When a user joins, personal `GOAL` items are spawned per blueprint using `ROUTINE_PARTICIPATION` bridge records.
- `getRoutineByCode` and `getDiscoverRoutines` are public (no auth) — intentional for sharing previews and onboarding.

---

## BACKEND — Lambda: Real-Time & Stream Processors

> Event-driven processors for real-time updates, social features, and async workflows. Real-time uses **AppSync GraphQL subscriptions** (not WebSocket API Gateway).

| File                                  | Trigger                                                          | What it does                                                                                                                                                                                                                                                                              |
| ------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lambda/progressEventProcessor.ts`    | DynamoDB Streams (INSERT `PROGRESS_EVENT`, MODIFY `PROFILE`)     | On PROGRESS_EVENT insert: resolves the user's routine memberships, writes an idempotent activity log per routine, and fans out one SQS message per active member to the MemberSyncQueue. On PROFILE modify: syncs changed displayName/photoURL to all denormalized MEMBER and LEADERBOARD records. |
| `lambda/achievementNotification.ts`   | DynamoDB Streams (INSERT `ACHIEVEMENT`)                          | Acquires an optimistic lock on the achievement row, reads the user's profile and FCM token, builds a human-readable push message (personal best, streak milestone, perfect day, or goal completed), sends it via FCM, and marks the achievement as `notified = true` |
| `lambda/memberSyncConsumer.ts`        | SQS FIFO (`MemberSyncQueue.fifo`)                               | Handles `MEMBER_DISSOLVE` events and per-member progress sync: writes an idempotent snapshot slice, publishes an AppSync `publishRoutineProgress` mutation for real-time, applies an atomic leaderboard score delta with dedup guard, and enqueues `SOCIAL_PROGRESS` notifications |
| `lambda/blueprintSyncConsumer.ts`     | SQS FIFO (`BlueprintSyncQueue.fifo`)                             | Receives a `routineId` and `newBlueprints` array, fetches all active members, and calls `routineService.syncMemberBlueprints` for each member to create personal goal and participation records for newly added blueprints |
| `lambda/sendNotificationWorker.ts`    | SQS FIFO (`NotificationSendQueue.fifo`)                          | Handles `SOCIAL_PROGRESS` messages: reads the target and actor profiles from DynamoDB and sends a social progress FCM push notification to the target user with the actor's display name |
| `lambda/dlqRouter.ts`                 | SQS (dead-letter queues)                                         | Inspects error strings from DLQ messages and routes accordingly: transient DynamoDB errors are redriven back to the original queue with a new dedup ID; permanent errors (ResourceNotFound, SyntaxError) are logged and dropped |

**Notes:**

- **Real-time architecture**: `memberSyncConsumer` calls AppSync `publishRoutineProgress` mutation via HTTP (fire-and-forget). Clients subscribe to `onRoutineProgress(routineId)` via the Amplify GraphQL client. There is no WebSocket API Gateway.
- `progressEventProcessor` is triggered by DDB Streams with two filters: INSERT of `PROGRESS_EVENT` entities and MODIFY of `PROFILE` entities. `bisectBatchOnError` is enabled to isolate poisoned records.
- `achievementNotification` is triggered by DDB Streams on INSERT of `ACHIEVEMENT` entities only.
- `dlqRouter.ts` exists in the codebase but is NOT wired to any SQS trigger in the CDK stack — it is available for manual DLQ reprocessing.

---

## BACKEND — Lambda: Scheduled Jobs

> Background cron jobs running on EventBridge schedules.

| File                                 | Trigger                                                         | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lambda/sendNotification.ts`         | EventBridge every 15 minutes                                    | Queries `NotificationsEnabledIndex` GSI for all opt-in users with valid FCM tokens, filters to those whose configured notification time has passed and who have not been notified today, and enqueues one SQS FIFO message per eligible user (batched in groups of 10, up to 50 concurrent batch sends) into `NotificationQueue.fifo` for the consumer to send FCM |
| `lambda/sendNotificationConsumer.ts` | SQS FIFO trigger (`NotificationQueue.fifo`, batchSize=1)        | Fetches the user's profile, checks `lastNotifiedDate` idempotence gate, skips users who completed all goals today, sends a daily reminder FCM push with remaining goal count, writes `lastNotifiedDate` after success, and as a non-fatal follow-up sends a streak-loss re-engagement push if the user's highest active streak (7+ days) expired yesterday |
| `lambda/trackShareEvent.ts`          | `POST /v1/share-events`                                         | Validates required fields (`type`, `platform`, `date`) and writes a `SHARE_EVENT` item to DynamoDB under the user's partition with a 90-day TTL |

**Notes:**

- `sendNotification` (producer) queries `NotificationsEnabledIndex` — a sparse GSI where only PROFILE items with `notificationsEnabled = "true"` are indexed.
- `sendNotificationConsumer` runs at batchSize=1 so one bad FCM token never delays other users.
- `util/notifCap.ts` rate-limits notifications per user per day to prevent spam from the 15-min cron.
- Share events are stored but not surfaced in the UI yet — they're collected for future analytics.
- **Weekly group recap was removed** — there is no EventBridge rule or Lambda for this feature.

---

## BACKEND — Domain Logic

> Pure business logic files — no AWS SDK, no async, fully unit-testable.

| File                      | What it does                                                                                                                                                                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain/GoalEvaluator.ts` | Pure, side-effect-free business logic that computes whether a goal is achieved (`computeAchieved`), calculates daily and period-based streaks (current + longest), evaluates day summaries with color-coded scores, and detects earned achievements (personal best, streak milestone, perfect day, goal completed) |
| `domain/editWindow.ts`    | Validates whether a given date falls within the allowed retroactive edit window ("2-weeks" covers the current and previous ISO week; "2-months" covers the current and previous calendar month) and rejects future dates |
| `domain/types.ts`         | TypeScript interfaces for GoalEvaluator inputs and outputs (`FullStreakInput`, `StreakResult`, `DaySummaryInput`, `DaySummaryResult`) and for routine progress view data shapes (`RoutineProgressGoal`, `RoutineProgressMember`, `RoutineProgressView`) |

**Notes:**

- `GoalEvaluator` has zero imports from AWS or any external service. Run its tests with `npx jest test/domain/GoalEvaluator.test.ts` — no env vars, no mocks.
- All evaluation logic lives here, NOT scattered in lambdas. If you need to change how streaks or achievements work, this is the only file to modify.
- The frontend has its own mirror `features/goalProgress/domain/GoalEvaluator.ts` for instant optimistic UI — keep them in sync when changing rules.

---

## BACKEND — Services

> Orchestrate multi-step operations across models and the domain layer.

| File                            | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `services/ProgressService.ts`   | Orchestrates upserting goal progress by loading context from DynamoDB, checking idempotency via mutationId dedup records, computing new values/achieved/streaks/day summaries through GoalEvaluator, and writing everything atomically in a single DynamoDB TransactWrite that includes the progress record, outbox event, dedup marker, goal update, and day summary update |
| `services/OnboardingService.ts` | Completes user onboarding in a single atomic DynamoDB TransactWrite by updating the profile (marking onboarding complete, setting timezone and notification time) and creating initial goals from selected templates while incrementing the active goal count |
| `services/RoutineService.ts`    | Orchestrates all routine write operations: creating routines (with idempotency, rate limiting, goal caps, goal spawning), joining via invite code (with goal linking/spawning and snapshot backfill), leaving (with goal deactivation and participation cleanup), dissolving (via SQS fan-out), updating metadata (name, icon, invite regeneration, blueprint additions), and syncing new blueprints to existing members |

**Notes:**

- `ProgressService` is called by both `createGoalProgress` and `updateGoalProgress` — the only difference is the DDB write mode.
- The achievement detection step in `ProgressService` is wrapped in try/catch and is non-fatal.
- `RoutineService` is the single owner of all routine write logic. The handler files are thin dispatchers: parse input → call service → return HTTP response.

---

## BACKEND — Models

> Data-access layer — all DynamoDB read/write operations, organized by entity type.

| File                    | What it does                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model/Goals.ts`        | DynamoDB data-access layer for goals: create (with dedup and stats increment), get by ID, list with active/inactive/archived filtering, update with optimistic concurrency and behavioral-change streak reset, and delete with routine participation cleanup |
| `model/GoalProgress.ts` | Lean DynamoDB data-access layer for progress records: fetch by date (single item), query a date range for a specific goal via GSI1, fetch all progress for a single day across all goals, and query progress for all goals across a date range on the base table |
| `model/Profile.ts`      | DynamoDB data-access layer for profiles: create (including provider-based creation for Firebase auth), read, update with read-repair for the `notificationsEnabled` GSI attribute, and batch-fetch up to hundreds of profiles using chunked BatchGetItem with exponential backoff |
| `model/DaySummary.ts`   | DynamoDB data-access layer for daily summary records: upsert (preserving `createdAt` via `if_not_exists`), fetch by date, query a date range, and batch-create in chunks of 25 |
| `model/Routines.ts`     | DynamoDB data-access layer and Zod schemas for routines, members, blueprints, and invites: reading routines/members/invites, building item records (routine, member, invite, participation pairs, snapshot goals), updating metadata with OCC, and managing member status and invite codes |
| `model/schemas.ts`      | All Zod validation schemas and inferred TypeScript types for DynamoDB entities (Goal, GoalProgress, DaySummary, Profile, Achievement, RoutineParticipation, RoutineSnapshot, Leaderboard, ProgressEvent, IdempotencyDedup) and API input shapes |
| `model/enums.ts`        | Zod enum schemas and TypeScript types for all domain enumerations (GoalType, TrackingType, ProgressStyle, Frequency, Category, HealthDataType, DayStatusColor, AchievementType, CommonUnits) and numeric status flag constants |

**Notes:**

- Model files contain **no business logic** — only DDB calls. Logic lives in `domain/` and `services/`.
- `schemas.ts` is the single source of truth for data shapes. If you add a field anywhere, add it here first.
- `enums.ts` is imported by both model files and lambda handlers — always use these enums instead of raw strings.

---

## BACKEND — Utilities

> Shared helper modules used across multiple Lambda functions.

| File                              | What it does                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `util/auth.ts`                    | Extracts the authenticated caller's `principalId` from the API Gateway lambda authorizer context, supporting both v1 (REST) and v2 (HTTP) event formats |
| `util/db.ts`                      | Creates and exports a singleton DynamoDB `DocumentClient` for connection reuse across warm Lambda invocations, and exports a helper that reads the table name from the `GOALS_TABLE` environment variable |
| `util/errors.ts`                  | Defines a hierarchy of custom error classes (`AppError`, `NotFoundError`, `ValidationError`, `ConflictError`) with HTTP status codes and error codes, plus an `isAppError` type guard |
| `util/fcm.ts`                     | Firebase Admin SDK singleton; exports functions to send a single FCM push (returning `"sent"` or `"stale_token"`), send multicast to multiple tokens (returning stale tokens), and clear an invalid FCM token from a user's profile |
| `util/logger.ts`                  | Structured JSON logger that writes single-line JSON objects with level, message, timestamp, and arbitrary context fields to stdout for CloudWatch Logs ingestion and Insights querying |
| `util/normalizeDate.ts`           | Parses and normalizes an arbitrary date string into a strict `YYYY-MM-DD` UTC format, throwing an error if the input is not a valid date |
| `util/notifCap.ts`                | Atomic daily notification rate limiter using DDB `ADD` with a `ConditionExpression` — returns true if allowed (under cap), false if limit reached, with TTL for automatic cleanup |
| `util/progressOutboxConfig.ts`    | Exports three environment-variable-configurable constants (`OUTBOX_TTL_SECONDS`, `OUTBOX_MAX_ROUTINE_IDS`, `DE_DUP_TTL_SECONDS`) controlling the progress event outbox and deduplication record lifetimes |
| `util/response.ts`                | Centralized API Gateway response builder (`jsonResponse`) and `handleError` function that maps `AppError`, `ZodError`, DynamoDB `ConditionalCheckFailedException`/`TransactionCanceledException`, `SyntaxError`, and unknown errors to appropriate HTTP status codes |
| `util/retry.ts`                   | Generic async retry wrapper with exponential backoff and full jitter that retries on configurable DynamoDB error codes and inspects `TransactionCanceledException` cancellation reasons |
| `util/userDate.ts`                | Timezone-aware date utilities: `getUserToday(timezone)`, `getUserYesterday(timezone)`, `getCurrentIsoWeek(timezone)`, `getCurrentMonth(timezone)`, ISO week string helpers, and a UUID namespace constant for deterministic goal ID generation |
| `util/userRateLimiter.ts`         | Per-user daily rate limiter for sensitive write actions (JOIN_ROUTINE 10/day, LEAVE_ROUTINE 10/day, CREATE_ROUTINE 5/day, DELETE_ACCOUNT 3/day) using atomic DDB counters, failing open on unexpected errors |

**Notes:**

- `util/fcm.ts` requires Firebase Admin SDK credentials. The service account credentials must be set as environment variables on all Lambdas that call FCM directly (`sendNotificationConsumer`, `achievementNotification`, `sendNotificationWorker`, `memberSyncConsumer` via SQS fan-out).
- `util/notifCap.ts` uses DDB atomic ADD — there is no read-then-write race condition.

---

## BACKEND — Tests

| File                                    | What it does                                                                                                                                  |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `test/domain/GoalEvaluator.test.ts`     | Unit tests (zero AWS deps) verifying `computeAchieved` across all progress styles, `evaluateFullStreak` for daily and weekly frequencies including ISO week-year boundaries, `evaluateStreakUndo`, `evaluateDaySummary` scoring/color, and `evaluateAchievements` detection |
| `test/services/ProgressService.test.ts` | Unit tests (mocked DynamoDB) verifying `recomputeDaySummaryForDate`, idempotency via mutationId dedup, isActive guard rejection, retry on TransactionCanceledException, and streak recalculation on the undo path |
| `test/routines/createRoutine.test.ts`   | Unit tests for the createRoutine handler: 403 missing auth, 400 missing body, 409 routine/goal cap exceeded, 400 too many blueprints, 201 success |
| `test/routines/joinRoutine.test.ts`     | Unit tests for joinRoutine: 400 missing routineId, 404 invalid invite, 410 expired invite, 200 alreadyJoined, 201 success with spawnedGoalIds |
| `test/routines/leaveRoutine.test.ts`    | Unit tests for leaveRoutine: 400 missing routineId, 404 nonexistent routine, 400 OWNER_CANNOT_LEAVE, 400 non-active member, 200 success |
| `test/self-project.test.ts`             | Placeholder CDK synthesis test — currently has all assertions commented out |

**Notes:**

- Run `npx jest` in `Project26_backend/` to run all tests.
- Run `npx jest test/domain/GoalEvaluator.test.ts --no-coverage` for just the domain tests (fast, no mocks needed).

---

## BACKEND — Data Files

| File                           | What it does                                                                                                                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `templates/goalTemplates.json` | The goal template library served by `getGoalTemplates` — organized by type (habit, todo, goal) with pre-filled defaults for title, target, frequency, icon, etc. Edit this file to add or remove templates |
| `templates/mock.json`          | Mock DynamoDB items used in development and test setups                                                                                                                                                    |

---

## FRONTEND — App Screens

> All screens are defined in `src/app/` using Expo Router file-based routing.

| File                           | Route                   | What it does                                                                                                                                       |
| ------------------------------ | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/_layout.tsx`              | Root layout             | Wraps the entire app in providers: React Query, Auth, BottomSheet, SafeArea, Theme, Gesture Handler, background tasks, and calls `configureAmplify()` |
| `app/index.tsx`                | `/`                     | Entry point — checks auth state and onboarding flag, redirects to `/(tabs)/home` or `/login`                                                       |
| `app/onboarding.tsx`           | `/onboarding`           | Multi-step animated onboarding: browse templates, select starter goals, set timezone, "Join a group?" discover step, call `completeOnboarding`     |
| `app/privacy-policy.tsx`       | `/privacy-policy`       | Static privacy policy document (required by Apple and Google for apps using health data)                                                           |
| `app/settings.tsx`             | `/settings`             | Full settings screen: HealthKit/HealthConnect integration, data export, account deletion, privacy visibility, notification preferences             |
| `app/(auth)/sign-in.tsx`       | `/(auth)/sign-in`       | Email/password sign-in screen with animations and provider sign-in fallback                                                                        |
| `app/(auth)/sign-up.tsx`       | `/(auth)/sign-up`       | Email/password registration screen with Firebase Auth                                                                                              |
| `app/(tabs)/_layout.tsx`       | Tab bar layout          | Defines the 5-tab bottom navigation: Home, Explore, + (FAB), Progress, Profile                                                                     |
| `app/(tabs)/home.tsx`          | `/(tabs)/home`          | Main daily dashboard: categorized goal list, GoalProgressCards, day story viewer, weekly review card, CelebrationModal, routine completion avatars |
| `app/(tabs)/calendar.tsx`      | `/(tabs)/calendar`      | Reserved tab — currently redirects to home; visually hosts the "+" FAB button in the tab bar                                                       |
| `app/(tabs)/progress.tsx`      | `/(tabs)/progress`      | Progress heatmap: 365-day tile view per goal, category filter chips, goal detail drill-down                                                        |
| `app/(tabs)/explore.tsx`       | `/(tabs)/explore`       | Routine management: Starter Routines horizontal section, list of your routines, Create Routine button, join via code, RoutineDetailSheet           |
| `app/(tabs)/profile.tsx`       | `/(tabs)/profile`       | User profile: photo, display name, dark mode toggle, notification prefs, social notification toggle, archived goals, trophy room                   |
| `app/routines/join/[code].tsx` | `/routines/join/{code}` | Deep link handler for `ember://routines/join/{code}` — shows `JoinRoutinePreviewSheet` for the given invite code                                   |

**Notes:**

- Expo Router's file-based routing means the file path = the URL route. `(tabs)` and `(auth)` are route groups — they don't appear in the URL.
- The deep link scheme is `ember://` — configured in `app.config.ts`.

---

## FRONTEND — Goals Feature

> `src/features/goals/` — Everything for creating, viewing, and managing personal goals.

| File                                    | What it does                                                                                                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/CreateGoalSheet.tsx`        | Main bottom sheet for creating a new goal — multi-section form: basic info, appearance, frequency, dates, health data type; includes template picker mode |
| `components/GoalDetailSheet.tsx`        | Full goal view bottom sheet: displays edit form, streak stats, completion calendar, actions (archive / complete / delete)                                 |
| `components/GoalCard.tsx`               | Compact card for the progress tab goal list — shows icon, title, streak count                                                                             |
| `components/GoalCardSkeleton.tsx`       | Animated shimmer loading placeholder for `GoalCard`                                                                                                       |
| `components/GoalCategoryGroup.tsx`      | Groups goals by category (Habits / Todos / Goals) with a collapsible header and the list of `GoalProgressCard`s                                           |
| `components/EditGoalForm.tsx`           | Editable form inside `GoalDetailSheet` — reuses the same section components as `CreateGoalSheet`                                                          |
| `components/BasicInfoSection.tsx`       | Form section: goal title, description, and icon picker                                                                                                    |
| `components/DatesSection.tsx`           | Form section: start date and optional end date pickers                                                                                                    |
| `components/AppearanceSection.tsx`      | Form section: color theme selection and icon picker                                                                                                       |
| `components/GeneralSettingsSection.tsx` | Form section: frequency (daily/weekly), tracking type, target value and unit                                                                              |
| `components/CategoryFilterHeader.tsx`   | Horizontal scrollable filter chips: All / Habits / Todos / Goals — filters the progress tab goal list                                                     |
| `components/GoalCalendar.tsx`           | Monthly calendar grid in `GoalDetailSheet` — tiles are colored by completion status for each day                                                          |
| `components/HomeEmptyState.tsx`         | Full-screen empty state shown on the home tab when the user has no active goals                                                                           |
| `components/TrendChart.tsx`             | Skia-based 7-day bar chart showing a goal's recent daily progress values relative to its target                                                           |
| `lifecycleStatus.ts`                    | Single source of truth for the `isActive` numeric enum (0=Paused, 1=Active, 3=Completed, 4=Archived). Exports `GoalLifecycleStatus` + predicates (`isActive`, `isPaused`, `isCompleted`, `isArchived`, `isTerminal`). Centralizes comparisons so numeric-vs-string drift is caught in one place. Use these helpers, **never** raw `=== 1`. |
| `components/AccordionRow.tsx`           | Reusable expandable/collapsible row used to section the goal creation form                                                                                |
| `components/NavigationRow.tsx`          | Tappable list row with a right chevron — opens a sub-sheet (e.g. frequency picker)                                                                        |
| `components/SelectionOption.tsx`        | Single selectable option row with a checkmark when selected                                                                                               |
| `components/SelectionView.tsx`          | Full-screen selection list container (used for category, frequency, unit, etc.)                                                                           |
| `components/styles.ts`                  | Shared `StyleSheet` styles for all goal components                                                                                                        |
| `hooks/index.ts`                        | All goal data hooks: `useGoals()`, `useCreateGoal()`, `useUpdateGoal()`, `useArchiveGoal()`, `useDeleteGoal()`                                            |
| `hooks/useGoalForm.ts`                  | Form state management for goal creation/editing — handles validation, default values, derived fields                                                      |
| `hooks/useGoalCalendar.ts`              | Fetches and formats a goal's completion history into a calendar-ready data structure                                                                      |
| `hooks/useGoalTemplates.ts`             | Fetches the goal template library and provides template selection state                                                                                   |
| `services/goals.ts`                     | HTTP client functions for all goal endpoints: `createGoal`, `getGoal`, `getGoals`, `updateGoal`                                                           |
| `services/goalTemplates.ts`             | HTTP client function for `GET /v1/goalTemplates`                                                                                                          |
| `domain/GoalFormEvaluator.ts`           | Pure validation logic for the goal form — validates field combinations, computes valid tracking types for a given goal type                               |
| `types.ts`                              | TypeScript types: `Goal`, `GoalType`, `TrackingType`, `GoalTemplate`, `HealthDataType`, `GoalFrequency`                                                   |
| `index.ts`                              | Barrel re-export for the goals feature module                                                                                                             |

---

## FRONTEND — Goal Progress Feature

> `src/features/goalProgress/` — All UI for logging and viewing daily progress.

| File                                      | What it does                                                                                                                                                                                                                                   |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/GoalProgressCard.tsx`         | Primary home screen widget — shows today's progress for one goal with inline one-tap logging controls; tapping the card opens `GoalProgressSheet`                                                                                              |
| `components/GoalProgressCard.styles.ts`   | Extracted `StyleSheet` for `GoalProgressCard`                                                                                                                                                                                                  |
| `components/OutboxDeadLetterBanner.tsx`   | Persistent banner mounted in `app/(tabs)/home.tsx` that surfaces dead-lettered progress writes (failed > 5 retries). Single "Retry all" CTA resets every dead-lettered entry to pending and re-drains. Auto-retry on network reconnect is wired separately in `app/_layout.tsx` via NetInfo. |
| `components/EditGoalSheet.tsx`            | Detailed progress editor inside `GoalProgressSheet` — date navigation arrows, manual value input, notes field. Lifecycle handlers (pause/complete/archive) invalidate `goalKeys.all`, `summaryKeys.all`, and `goalProgress` so heatmap + day-summary refresh immediately. |
| `components/BooleanContent.tsx`           | Progress card content for yes/no boolean goals — large checkmark button                                                                                                                                                                        |
| `components/CounterContent.tsx`           | Progress card content for count-based goals — + and - buttons with current value                                                                                                                                                               |
| `components/CumulativeBooleanContent.tsx` | Progress card content for cumulative boolean goals (e.g. "did this 3 of 5 times")                                                                                                                                                              |
| `components/TimerContent.tsx`             | Progress card content for timer goals — shows elapsed time, start/pause/stop buttons                                                                                                                                                           |
| `components/GoalTimerController.tsx`      | Manages timer state machine: idle → running → paused → complete                                                                                                                                                                                |
| `components/GoalTimerIndicator.tsx`       | Animated ring/arc indicator showing timer progress as a proportion of the target duration                                                                                                                                                      |
| `components/ManualInputModal.tsx`         | Numeric keyboard modal for entering a precise value — used when the +/- buttons aren't granular enough                                                                                                                                         |
| `components/styles.ts`                    | Shared styles for progress components                                                                                                                                                                                                          |
| `GoalProgressSheet.tsx`                   | Bottom sheet that wraps the full progress editing experience for a single goal                                                                                                                                                                 |
| `index.ts`                                | Barrel re-export for the goal progress feature module                                                                                                                                                                                          |
| `hooks/index.ts`                          | All progress hooks: `useBulkGoalProgressList()`, `useUserProgressByDate()`, `useCreateProgress()`, `useUpdateProgress()`, `useMergedProgress()`, `useGoalDisplay()`, `useGoalOptimisticActions()`, `useGoalTimer()`, `useProgressAnimations()` |
| `hooks/useSessionReconciler.ts`           | Detects when the app was backgrounded mid-timer and reconciles elapsed time using the persisted `timerStore` state                                                                                                                             |
| `hooks/progressMutationHandlers.ts`       | Shared `onSuccess` / `onError` React Query mutation handlers — used by both create and update progress mutations                                                                                                                               |
| `hooks/useCustomStep.ts`                  | Loads and persists a per-goal custom increment step size from AsyncStorage, falling back to a smart default                                                                                                                                    |
| `hooks/useGoalDisplay.ts`                 | Orchestrates the display value, derived context, descriptions, animations, and increment/decrement handlers for a single GoalProgressCard using a layered merge: Timer Session > Outbox Intent > Server Cache                                  |
| `hooks/useGoalOptimisticActions.ts`       | Writes progress to the local outbox via `progressStore` for instant UI response, then enqueues the server mutation                                                                                                                             |
| `hooks/useGoalTimer.ts`                   | Manages the timer lifecycle for timer-type goals: start, pause, resume, stop, and integration with `timerService` and `timerStore`                                                                                                             |
| `hooks/useMergedProgress.ts`              | Provides a local-first reactive progress value by merging three sources in priority order: active timer session, outbox pending writes, and server cache                                                                                       |
| `hooks/useProgressAnimations.ts`          | Reanimated shared values and derived animated styles for progress card fill bars and achievement celebrations                                                                                                                                   |
| `domain/GoalEvaluator.ts`                 | Frontend mirror of the backend `GoalEvaluator` — used for instant optimistic UI updates before the server responds                                                                                                                             |
| `domain/GoalStrategies.ts`                | Strategy pattern: one strategy class per tracking type (Boolean, Counter, Cumulative, Timer) — each implements `display()`, `increment()`, `decrement()`, `canLog()`                                                                           |
| `domain/formatters.ts`                    | Formats progress values for display: duration → "1h 23m", steps → "1,234 steps", etc.                                                                                                                                                          |
| `services/goalProgress.ts`                | HTTP client functions for all progress endpoints + optimistic update cache helpers for React Query                                                                                                                                             |

**Notes:**

- `useGoalOptimisticActions` is the key hook for logging — it writes to the outbox for instant UI, then fires the server mutation.
- The `timerStore` (Zustand) persists timer state to MMKV storage so a timer survives app backgrounding and crashes.
- `useSessionReconciler` runs on app foreground to reconcile any time that elapsed while the app was in the background.

---

## FRONTEND — Day Summary Feature

> `src/features/daySummary/` — Weekly review and calendar/heatmap data.

| File                              | What it does                                                                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `components/DayReviewSheet.tsx`   | Full-screen bottom sheet summarizing a completed day: completion %, day score, per-goal results, streak milestones, achievements earned |
| `components/StoryCards.tsx`       | Visual story-style card collection rendered inside the day review                                                                       |
| `components/WeeklyReviewCard.tsx` | Compact card on the home screen showing the 7-day completion trend as a bar chart                                                       |
| `domain/CalendarEvaluator.ts`     | Pure logic for heatmap calendar calculations: maps day summary scores to tile colors, week grid layout                                  |
| `hooks/index.ts`                  | `useCachedDaySummaries(startDate, endDate)` — fetches and caches day summaries; uses the date range as the React Query cache key        |
| `hooks/keys.ts`                   | React Query key factory for day summary queries                                                                                         |
| `hooks/useSummaryCache.ts`        | Cache management helpers: prefetching adjacent weeks, invalidating stale ranges                                                         |
| `services/daySummary.ts`          | HTTP client functions: `getDaySummary(date)`, `getDaySummaries(startDate, endDate)`                                                     |
| `index.ts`                        | Barrel re-export for the day summary feature module                                                                                     |

---

## FRONTEND — Day Story Feature

> `src/features/dayStory/` — The shareable "story" viewer and celebration experience. Strava-inspired dark share cards.

| File                                    | What it does                                                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `DayStoryViewer.tsx`                    | Full-screen modal with swipeable FlatList of story cards, ViewShot capture for sharing, background picker, and share toolbar             |
| `index.ts`                              | Barrel re-export for the day story feature module                                                                                       |
| `styles.ts`                             | Shared `StyleSheet` for the day story viewer layout (container, header, content, card list)                                             |
| `types.ts`                              | TypeScript interfaces: `StoryGoal`, `StoryGoalProgress`, `StoryDaySummary`                                                              |
| `components/BackgroundPickerSheet.tsx`  | Bottom sheet for picking a background theme (light/dark/transparent/image) when exporting a story card                                   |
| `components/CardContainer.tsx`          | Shared card wrapper that applies the selected background mode (light/dark/transparent/image) — exports `CARD_WIDTH` and `CARD_HEIGHT`    |
| `components/CategoryBreakdownSlide.tsx` | Story slide showing per-category completion breakdown                                                                                   |
| `components/CelebrationModal.tsx`       | Full-screen modal with Reanimated celebration animation — triggered when the user earns a milestone achievement or a perfect day         |
| `components/DayCompleteCard.tsx`        | Story slide: "You completed your day!" with the overall score                                                                           |
| `components/GlassCapsule.tsx`           | Compact glass-pill badge showing the day's best metric (best streak or done/total count)                                                |
| `components/GoalPickerSheet.tsx`        | Bottom sheet for selecting which goal to feature on a per-goal story card                                                               |
| `components/ShareToolbar.tsx`           | Toolbar with share actions: Instagram Stories, generic share, save to gallery, copy text                                                |
| `components/StampChain.tsx`             | Visual chain of achievement stamps displayed in sequence                                                                                |
| `components/StampManifest.tsx`          | Minimal dark card featuring a glass-capsule summary badge and goal icons — daily signature stamp                                        |
| `components/StampPicker.tsx`            | UI for attaching stamps to a story before sharing                                                                                       |
| `components/StampPulse.tsx`             | 7 pill bars (one per day), height encodes completion rate — weekly pulse visualization                                                  |
| `components/StampReceipt.tsx`           | Thermal receipt aesthetic card — monospace, box-drawing rules, completed goals marked with checkmarks, pending with circles              |
| `components/StampSignal.tsx`            | Per-goal per-day stamp card with three render modes: count (stat strip), duration (SVG arc ring), boolean (large emoji)                  |
| `components/StatsCard.tsx`              | Per-goal metric spotlight card — shows the goal's value with its accent color                                                           |
| `components/StoryCardDesign1.tsx`       | Primary story card design showing goal completion grid with done/total count                                                            |
| `components/StreakCard.tsx`             | Story card showing current and longest streak with week dots and tier-based styling                                                     |
| `components/TemplateCompletedGrid.tsx`  | Grid card showing all completed goals with their icons and values                                                                       |
| `components/TemplateWeekly.tsx`         | Weekly bar chart card showing completion totals and streak count                                                                         |
| `components/WeekCard.tsx`               | Week overview card with per-day scores and consistency percentage                                                                       |
| `domain/StoryCardFactory.ts`            | Pure factory: converts a day summary + goal list into an ordered array of `StoryCard` data objects                                      |
| `domain/StoryEvaluator.ts`              | Pure logic: determines which story slides to show based on what was completed (achievement cards, streak cards, perfect day card, etc.) |
| `hooks/useDayStoryData.ts`              | Loads all data needed to render the day story: day summary, goals, progress records                                                     |
| `hooks/useStampCapture.ts`              | Captures a rendered story card as an image using `react-native-view-shot` for the share flow                                            |
| `hooks/useStoryGallery.ts`              | Manages the multi-slide story viewer state: current slide index, swipe gestures, slide transitions                                      |
| `hooks/useStoryGoalSelection.ts`        | Handles goal selection state when the user picks which goals to include in a shared story                                               |
| `utils/CardBackgroundContext.tsx`        | React Context provider that supplies the selected card background mode and image URI, with theme override for light/dark modes           |
| `utils/storyShare.ts`                   | Capture and share utilities: `captureCard` (ViewShot → PNG), `shareToInstagramStories`, `shareGeneric`, `saveToGallery`, plus fire-and-forget share event tracking |
| `utils/useStoryColors.ts`               | Hook that returns the story card color palette with automatic transparent-mode adjustments                                              |

---

## FRONTEND — Routines Feature

> `src/features/routines/` — Group goal tracking with real-time AppSync updates.

| File                                      | What it does                                                                                                                                                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/CreateRoutineSheet.tsx`       | Bottom sheet form for creating a routine: name, color, icon, and a list of goal blueprints                                                                                                                                                  |
| `components/RoutineDetailSheet.tsx`       | Full routine view with **4 tabs** (Today, Members, Board, Activity). Header `...` menu surfaces an ActionSheet: owners see Edit/Dissolve, members see Leave. Members tab shows "Manage members" button for owners (opens RoutineMembersSheet for kick). Includes read-repair logic, AppSync real-time sync gate, and open-time cache invalidation. |
| `components/RoutineSettingsSheet.tsx`     | Owner-only edit form for routine display fields (name, description, icon, color). Opened from the RoutineDetailSheet `...` menu via Edit. Blueprint editing is intentionally NOT exposed here — mid-routine blueprint changes require member resync via `BlueprintSyncQueue`. |
| `components/RoutineCard.tsx`              | Compact card in the Explore tab list — shows routine name, member count, today's group completion %                                                                                                                                         |
| `components/RoutineCard.styles.ts`        | Extracted `StyleSheet` for `RoutineCard`                                                                                                                                                                                                    |
| `components/RoutineInviteSheet.tsx`       | Shows the shareable invite code, expiry countdown (ticks live every 60s), and a Share button. Accessible from the RoutineDetailSheet header's invite icon and the Explore tab action menu.                                                  |
| `components/RoutineMembersSheet.tsx`      | Owner-only management surface: per-member kick action with confirmation dialog, owner badge on the creator row. Mounted from RoutineDetailSheet's Members tab via the "Manage members" button (owner-gated).                                |
| `components/JoinRoutinePreviewSheet.tsx`  | Preview sheet before joining: displays routine name, member list, goal list, and a Join button                                                                                                                                              |
| `components/RoutineActionSheet.tsx`       | Bottom sheet with actions for creating a new routine or joining with an invite code                                                                                                                                                          |
| `components/GoalPickerSheet.tsx`          | Bottom sheet for linking an existing personal goal to a routine blueprint during the join flow                                                                                                                                                |
| `components/GoalSeenAvatars.tsx`          | Instagram-style "seen" indicator showing overlapping mini avatars of members who achieved a specific goal today                                                                                                                              |
| `components/RoutineGoalProgressRow.tsx`   | Per-goal row in the Today tab showing one blueprint with all members' completion status via GoalSeenAvatars                                                                                                                                 |
| `components/RoutinePlayerCard.tsx`        | Card showing one member's per-blueprint completion status with goal dots and avatar                                                                                                                                                          |
| `components/RoutineMemberRow.tsx`         | One row in the Members tab — member avatar, display name, per-goal completion dots, overall fraction                                                                                                                                        |
| `components/MemberAvatarStack.tsx`        | Horizontally stacked avatar row showing the first N member photos (with overflow count)                                                                                                                                                     |
| `components/RoutineLeaderboard.tsx`       | Leaderboard table: rank badges, member name, 7-day completion %, progress bars, skeleton loading, empty and error states                                                                                                                    |
| `components/RoutineProgressRing.tsx`      | Animated ring/arc chart showing the group's aggregate completion % for today                                                                                                                                                                |
| `components/RoutineCompletionAvatars.tsx` | Home screen widget — shows avatar stack of routine members who completed all their goals today                                                                                                                                              |
| `components/StoryAvatar.tsx`              | Animated circular avatar with an SVG progress ring and optional "live" pulse animation                                                                                                                                                      |
| `hooks/index.ts`                          | All routine hooks: `useMyRoutines()`, `useRoutine()`, `useRoutineProgress()`, `useRoutineSnapshot()`, `useRoutinePreview()`, `useRoutineLeaderboard()`, `useRoutineActivity()`, `useCreateRoutine()`, `useUpdateRoutine()`, `useJoinRoutine()`, `useLeaveRoutine()` |
| `hooks/useJoinRoutineFlow.ts`             | Manages the full join-routine flow: preview fetch, blueprint-to-existing-goal matching/linking, picker state, and final join mutation                                                                                                         |
| `hooks/useRoutineRealtimeSync.ts`         | Subscribes to AppSync `onRoutineProgress` for a given routineId via Amplify's GraphQL client; calls `onUpdate` callback with each progress event; degrades silently to polling on error |
| `services/routineApi.ts`                  | HTTP client functions for all routine endpoints including `getRoutineLeaderboard()` and `getRoutineActivity()`                                                                                                                              |
| `domain/RoutineEvaluator.ts`              | Pure logic for routine-level aggregations: `aggregateGroupProgress()`, member completion rates, rank calculations — no React dependencies, testable standalone                                                                               |
| `types.ts`                                | TypeScript types: `Routine`, `RoutineMembership`, `RoutineMember`, `RoutineProgressView`, `LeaderboardMember`, `RoutineLeaderboard`, `RoutineBlueprint`, `RoutineActivityResponse`, `JoinBlueprintLinkDecision`                              |
| `index.ts`                                | Barrel re-export for the routines feature module                                                                                                                                                                                            |
| `__tests__/RoutineEvaluator.test.ts`      | Unit tests for `RoutineEvaluator.aggregateGroupProgress` and related pure functions                                                                                                                                                         |

**Notes:**

- **Real-time uses AppSync**, not WebSocket. `useRoutineRealtimeSync` subscribes to `onRoutineProgress(routineId)` via Amplify's `generateClient().graphql()`. If AppSync config is missing, it degrades silently to polling.
- `RoutineCompletionAvatars` on the home screen uses `useRoutineSnapshot` (O(1) GetItem) not `useRoutineProgress` (expensive query) — keep it that way.

---

## FRONTEND — Profile Feature

> `src/features/profile/` — User profile data access and identity surface components.

| File                     | What it does                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `../../app/(tabs)/profile.tsx` | The main Profile tab. Uses a 2-tab architecture (Overview/Trophy Room), showcasing user identity, best streaks, monthly consistency, and lifecycle management for active/paused/completed goals without nested modals. |
| `components/MonthConsistencyCard.tsx` | Data-driven insight component providing weekly-binned progress analysis for the current month with highlight styling for peak weeks. |
| `components/StreakArcCard.tsx` | SVG-based visualization for "Best Streak" metrics featuring a monospace ring indicator and a compact personal best pill. |
| `services/profileApi.ts` | HTTP client functions: `getProfile()`, `updateProfile()`, `deleteAccount()`, `exportData()` — also defines the `UserProfile` TypeScript interface |
| `hooks/useProfile.ts`    | React Query hook wrapping `profileApi` — provides `profile`, `updateProfile` mutation, `deleteAccount` mutation, `exportData` mutation            |

---

## FRONTEND — Auth Feature

> `src/features/auth/` — Sign-in screen animations.

| File                           | What it does                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `hooks/useSignInAnimations.ts` | Reanimated 3 shared values and derived animated styles for the sign-in screen — gradient fade-in, title scale, button slide-up |

---

## FRONTEND — Notifications Feature

> `src/features/notifications/`

| File                     | What it does                                                                                                                                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NotificationManager.ts` | Requests notification permissions on first launch, registers the Expo/FCM device token with the backend via `updateProfile`, handles foreground notification display using `expo-notifications`, and syncs local reminder schedules when notification settings change |

---

## FRONTEND — Shared Components

> `src/components/` — Reusable UI components used across multiple features.

### UI Library (`components/ui/`)

| File                          | What it does                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui/index.ts`                 | Barrel re-export for the UI component library                                                                                                  |
| `ui/Text.tsx`                 | Styled text with preset size variants (xs/sm/md/lg/xl/xxl) and weight variants (regular/medium/bold) — always use this instead of raw `<Text>` |
| `ui/Button.tsx`               | Styled pressable button with loading spinner, disabled state, and pressed scale animation                                                      |
| `ui/Screen.tsx`               | Safe-area-aware full-screen container — use as the root of every screen                                                                        |
| `ui/BrandHeader.tsx`          | App top header: logo, current date display, left/right navigation arrows for date browsing                                                     |
| `ui/TextField.tsx`            | Styled text input with label, error state, and focus ring                                                                                      |
| `ui/Card.tsx`                 | Generic rounded card container with shadow                                                                                                     |
| `ui/Icon.tsx`                 | Thin wrapper around the icon library — pass `name` and `size`                                                                                  |
| `ui/IconPicker.tsx`           | Scrollable grid of emoji/icon options for the goal creation form                                                                               |
| `ui/CategoryIcon.tsx`         | Maps a goal `category` enum value to its display icon                                                                                          |
| `ui/EmptyState.tsx`           | Generic empty state: centered icon, title, subtitle, optional action button                                                                    |
| `ui/EmberStamp.tsx`           | Renders an achievement stamp badge with its icon and milestone label                                                                           |
| `ui/StreakIcon.tsx`           | Flame icon with streak count — color changes by streak tier                                                                                    |
| `ui/StreakBadge.tsx`          | Reusable badge displaying a streak count with tier-based color styling driven by `getStreakTier`                                                |
| `ui/CircularProgress.tsx`     | Half-circle animated SVG progress arc using Reanimated — used for compact progress indicators                                                  |
| `ui/CircularProgressFull.tsx` | Full 360-degree animated SVG progress ring using Reanimated — used for avatar performance rings                                                |
| `ui/Shimmer.tsx`              | Breathing pulse shimmer component for skeleton loading states using Reanimated opacity animation                                               |
| `ui/AutoImage.tsx`            | Image component that auto-scales dimensions based on the remote image's aspect ratio                                                           |
| `ui/TabBarBackground.tsx`     | Custom translucent/blur tab bar background (replaces default opaque one)                                                                       |
| `ui/ToastHost.tsx`            | Renders the global toast notification queue — mounted once in `_layout.tsx`                                                                    |
| `ui/Header.tsx`               | Navigation bar header component used in modal/stack screens                                                                                    |
| `ui/ListItem.tsx`             | Generic tappable list row with left icon, title, subtitle, and right accessory slot                                                            |
| `ui/OptionButton.tsx`         | Selectable pill/button — filled when selected, outlined when not                                                                               |
| `ui/TsogLogo.tsx`             | App "TSOG" logo component                                                                                                                      |

### Other Shared Components

| File                              | What it does                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `AppleSignInButton.tsx`           | Apple sign-in button styled to Apple's HIG requirements                                                                   |
| `GoogleSignInButton.tsx`          | Google sign-in button styled to Google's brand guidelines                                                                 |
| `Toggle/Switch.tsx`               | Styled iOS-style toggle switch                                                                                            |
| `Toggle/Checkbox.tsx`             | Square checkbox with checkmark                                                                                            |
| `Toggle/Radio.tsx`                | Round radio button                                                                                                        |
| `Toggle/Toggle.tsx`               | Base pressable toggle component used by Switch, Checkbox, and Radio                                                       |
| `calendar/HeatmapSvg.tsx`         | SVG-based heatmap visualization — renders 52 weeks x 7 days of colored tiles                                              |
| `ErrorBoundary/ErrorBoundary.tsx` | React error boundary — catches any render-phase JavaScript crash and renders a safe fallback UI instead of a white screen |
| `ErrorBoundary/ErrorDetails.tsx`  | Renders the error details screen with error message, stack trace, and a reset button                                      |

---

## FRONTEND — Providers, Stores & Infrastructure

### Providers (`src/providers/`)

| File                               | What it does                                                                                                                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `providers/AuthProvider.tsx`       | Firebase `onAuthStateChanged` listener — when the Firebase user changes, fetches a fresh API JWT, updates `authStore`, and bootstraps the user's `currentUid` in `userStore` |
| `providers/HealthSyncProvider.tsx` | Mounts `HealthSyncService`, registers `AppState` change listener to trigger a foreground re-sync when the app comes back into focus (Android-specific for Health Connect)    |

### Zustand Stores (`src/store/`)

> Zustand stores are the global client-side state. React Query handles server state — Zustand handles everything else.

| File                        | What it does                                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `store/authStore.ts`        | Firebase `User` object, API JWT string, `isLoading` flag, `hasCompletedOnboarding` flag, and `signOut()` action                           |
| `store/userStore.ts`        | `currentUid: string` — the single source of truth for the logged-in user's ID, used by all hooks that build API request paths             |
| `store/progressStore.ts`    | Optimistic progress mutations with React Query integration — stores an outbox of pending writes and drains them on reconnect              |
| `store/timerStore.ts`       | Active timer state per `goalId`: running/paused/idle, accumulated milliseconds, session start time — persisted to MMKV for crash recovery |
| `store/healthEventStore.ts` | Queue of real-time health/achievement events received from the Health sync service — consumed by the celebration modal                    |
| `store/privacyStore.ts`     | User's visibility preference (public / friends / private) for routine progress and profile visibility                                     |

### React Query & Amplify (`src/lib/`)

| File                 | What it does                                                                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/react-query.ts` | Configures the global `QueryClient`: stale times, retry counts, online manager (pauses queries when offline), focus manager, and optional MMKV-backed persistence for offline cache |
| `lib/amplify.ts`     | Configures the Amplify GraphQL client for AppSync subscriptions using API_KEY auth — called once at module scope in `_layout.tsx`; skips configuration if APPSYNC_URL is empty      |

---

## FRONTEND — Services & API

> `src/services/` — Non-feature-specific services for auth, health, and the HTTP client.

| File                                      | What it does                                                                                                                                                                 |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `services/authService.ts`                 | Firebase Auth wrapper class: `signInWithGoogle()`, `signInWithApple()`, `signInWithEmail()`, `signOut()`, `onAuthStateChanged()` listener setup                              |
| `services/timerService.ts`                | Clock management outside the React render cycle: runs a 200ms `setInterval` ticker, writes elapsed time to `timerStore`, triggers local notifications when a timer completes |
| `services/user.ts`                        | User ID helper functions and URL path builder helpers (e.g. `userPath(uid)` → `"/users/{uid}"`)                                                                              |
| `services/api/index.ts`                   | Configured `apisauce` (Axios wrapper) client — base URL from `config/index.ts`, response interceptor that injects the JWT from `authStore` into every request                |
| `services/api/apiProblem.ts`              | Maps HTTP status codes and network errors to a typed `ApiProblem` union                                                                                                      |
| `services/api/formatApiError.ts`          | Formats an `ApiProblem` into a user-facing error message string                                                                                                              |
| `services/api/types.ts`                   | `ApiResponse<T>` wrapper type used for all API call return values                                                                                                            |
| `services/health/HealthSyncService.ts`    | Fetches step count, active energy, and other health metrics from HealthKit (iOS) or Health Connect (Android) and posts them to goal progress endpoints                       |
| `services/health/BackgroundHealthSync.ts` | Registers iOS `HKObserverQuery` background delivery — health updates push to the app even when it's in the background                                                        |
| `services/health/index.ts`                | Re-exports the public API of the health service module                                                                                                                       |

---

## FRONTEND — Config & Theme

### Config (`src/config/`)

| File                    | What it does                                                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config/index.ts`       | Selects `config.dev.ts` or `config.prod.ts` based on `__DEV__` and merges with `config.base.ts` — this is the only import other files should use                                                      |
| `config/config.base.ts` | Shared config fields: `persistNavigation`, `catchErrors`, `exitRoutes`, and type definitions for `WS_API_URL`, `APPSYNC_URL`, `APPSYNC_API_KEY`                                                      |
| `config/config.dev.ts`  | Development environment: `API_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_REDIRECT_URI`, `BACKEND_AUTH_URL`, `WS_API_URL`, `APPSYNC_URL`, `APPSYNC_API_KEY`                                                     |
| `config/config.prod.ts` | Production environment: `API_URL`, `WS_API_URL` (legacy), `APPSYNC_URL`, and `APPSYNC_API_KEY` — update `APPSYNC_URL` and `APPSYNC_API_KEY` after `cdk deploy`                                        |

### Theme (`src/theme/`)

| File                      | What it does                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `theme/colors.ts`         | Full light-mode color palette — all named semantic colors (primary, success, error, background, surface, etc.) |
| `theme/colorsDark.ts`     | Full dark-mode color palette — mirrors `colors.ts` with dark variants                                          |
| `theme/context.tsx`       | Theme React Context provider — exports `useAppTheme()` hook which returns `{ theme, isDark, toggleTheme }`     |
| `theme/context.utils.ts`  | Theme helper functions: `resolveColor(key)`, `applyOpacity(color, opacity)`                                    |
| `theme/spacing.ts`        | Spacing constants for light mode: `xs=4`, `sm=8`, `md=16`, `lg=24`, `xl=32`, `xxl=48`                          |
| `theme/spacingDark.ts`    | Spacing variant for dark mode (typically identical)                                                            |
| `theme/typography.ts`     | Font family definitions and size scale                                                                         |
| `theme/timing.ts`         | Animation duration constants: `fast=150ms`, `normal=300ms`, `slow=500ms`                                       |
| `theme/styles.ts`         | Reusable shared `StyleSheet` style objects used across components                                              |
| `theme/theme.ts`          | Assembles the complete theme object from colors, spacing, typography, and timing                               |
| `theme/dayStoryColors.ts` | Celebration and day story specific color palette with dark/light/transparent mode support                       |
| `theme/FontContext.tsx`   | Manages Expo font loading — `useFonts()` hook and font-ready gate                                              |
| `theme/types.ts`          | TypeScript type definitions for the theme object                                                               |
| `theme/index.ts`          | Re-exports the public API of the theme module                                                                  |

---

## FRONTEND — Utils

> `src/utils/` — Shared utility functions and hooks not tied to a specific feature.

| File                              | What it does                                                                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `utils/date.ts`                   | Date parsing, formatting, and arithmetic helpers (add days, compare dates, to ISO string)                                                                    |
| `utils/formatDate.ts`             | Locale-aware date formatting — "Mon, Apr 9" style strings using the user's locale                                                                            |
| `utils/calendar.ts`               | Calendar grid utilities: ISO week number from date, week start/end clamping, days-in-month                                                                   |
| `utils/weekGrid.ts`               | Week grid layout calculations for the heatmap — builds the 52x7 grid data structure                                                                          |
| `utils/editWindow.ts`             | Frontend check for whether a date is within the retroactive edit window — disables the edit UI for dates outside the window before making an API call          |
| `utils/streakTiers.ts`            | Maps streak lengths to named tiers (Bronze/Silver/Gold/Diamond) and their visual treatment (color, flame icon variant, background)                            |
| `utils/toast.ts`                  | Imperative `showToast(message, type)` function — dispatches to the `ToastHost` component                                                                     |
| `utils/format.ts`                 | General text formatting: truncate, capitalize, pluralize, `formatDuration`                                                                                   |
| `utils/colorUtils.ts`             | Color manipulation: `hexToRgba()`, `lighten()`, `darken()`, `interpolateColor()`                                                                             |
| `utils/feedback.ts`               | Global haptic feedback system wrapping `expo-haptics`: `light()`, `medium()`, `heavy()`, `success()`, `error()`, `selection()` — skips on web                 |
| `utils/activeTimezone.ts`         | Singleton module storing the user's active timezone for use in non-React contexts (e.g. from service classes)                                                |
| `utils/AppDateProvider.tsx`       | React Context that provides `userToday` (the user's local date string) to all components                                                                     |
| `utils/openLinkInBrowser.ts`      | Opens a URL in the system browser using `expo-linking`                                                                                                       |
| `utils/useHeader.tsx`             | Custom hook for configuring the navigation header from within a screen component                                                                             |
| `utils/useSafeAreaInsetsStyle.ts` | Returns a `paddingBottom`/`paddingTop` style based on safe area insets — for bottom sheets and modals                                                        |
| `utils/storage/index.ts`          | MMKV-backed persistent storage wrapper: `storage.set(key, value)`, `storage.getString(key)` — faster than AsyncStorage                                       |

---

## FRONTEND — Constants & i18n

### Constants (`src/constants/`)

| File                           | What it does                                                                                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constants/goalOptions.ts`     | Dropdown config for the goal creation form: frequency options, tracking type options, category options with labels and icons                       |
| `constants/unitDefinitions.ts` | Human-readable labels, format functions, and step sizes for all unit types: steps, km, miles, minutes, hours, calories, glasses, reps, sets, pages |

### i18n (`src/i18n/`)

| File                | What it does                                                                           |
| ------------------- | -------------------------------------------------------------------------------------- |
| `i18n/en.ts`        | All English translation strings organized by screen/feature                            |
| `i18n/index.ts`     | i18n library setup (i18next) — sets default locale, links translation files             |
| `i18n/translate.ts` | `translate(key)` utility function — re-exported shorthand for the i18n `t()` function  |

### Types (`src/types/`)

| File               | What it does                                       |
| ------------------ | -------------------------------------------------- |
| `types/images.d.ts` | TypeScript module declarations for image file imports |

---

## Root Documentation Files

> Files that exist at or near the `Self_Project/` root.

| File                                                   | What it does                                                                                    |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                                            | Guidance file for Claude Code — project overview, commands, architecture summary                |
| `PROJECT_MAP.md`                                       | _(This file)_ — Complete file-by-file reference                                                 |
| `Project26_backend/README.md`                          | Backend CDK setup, AWS SSO login, and deployment guide                                          |
| `Project26_backend/ai_best_practices.md`               | AI workflow orchestration guidelines: plan mode, subagents, verification, lessons tracking       |
| `Project26_frontend/Project26-Front/README.md`         | Frontend auth strategy, user ID conventions, API client setup, and development guide             |
| `Project26_frontend/Project26-Front/SETUP.md`          | First-time environment setup instructions for the frontend                                      |
| `Project26_frontend/Project26-Front/best_practices.md` | Same AI workflow guidelines as the backend `ai_best_practices.md`                               |

---

## Quick Reference — Key Numbers

| Metric                 | Value                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DynamoDB tables        | 1 (`UserGoals`)                                                                                                                                              |
| GSIs                   | 4 on `UserGoals` (`GSI1` goal-centric, `GSI2` user→routines, `PublicRoutinesIndex` public routine discovery, `NotificationsEnabledIndex` opt-in push users)  |
| Lambda functions       | 42                                                                                                                                                           |
| HTTP routes            | 34                                                                                                                                                           |
| Real-time              | AppSync GraphQL API (`onRoutineProgress` subscription, API_KEY auth)                                                                                         |
| SQS queues             | 5 primary + 4 DLQs (`NotificationQueue.fifo`, `MemberSyncQueue.fifo`, `BlueprintSyncQueue.fifo`, `NotificationSendQueue.fifo`, `ProgressOutboxDlq`)          |
| EventBridge rules      | 1 (15-min notification cron)                                                                                                                                 |
| S3 buckets             | 2 (user avatars with CloudFront CDN, Swagger UI static site)                                                                                                 |
| Tab screens            | 5 (home, explore, +, progress, profile)                                                                                                                      |
| Auth screens           | 2 (sign-in, sign-up)                                                                                                                                         |
| Feature modules        | 8 (goals, goalProgress, daySummary, dayStory, routines, profile, auth, notifications)                                                                        |
| Zustand stores         | 6 (auth, user, progress, timer, healthEvent, privacy)                                                                                                        |
| Total TypeScript files | ~280                                                                                                                                                         |

---

_Last regenerated: April 2026 — built by reading every source file, not from existing documentation._
