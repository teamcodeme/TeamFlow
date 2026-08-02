# TeamFlow AI – Role-Based Automation Surfaces

## 1. Overview

Each role in TeamFlow sees a customized automation surface—AI-generated work that's relevant to their responsibilities. This document describes what each role sees, how they interact with AI outputs, and what remains in their hands.

---

## 2. BUSINESS_ANALYST Surface

### 2.1 Requirement Review Queue

**Where**: New section in Requirement Dashboard: "AI Proposals – Ready for Review"

**What BAs see**:
```
┌─────────────────────────────────────────────────────────────────┐
│ AI Proposals – Ready for Review (3 pending)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ✓ User Onboarding Flow – Profile Setup Module                   │
│   Status: PROPOSED (from transcript_abc123)                     │
│   Confidence: 87%                  Timestamp: 2026-08-02 14:12  │
│   Recording: [Play] (90 min)       Transcript: [View]           │
│   ───────────────────────────────────────────────────────────── │
│   Business Objective: Reduce time-to-first-value from 8 to < 3 │
│   Actors: New User, Customer Success Manager                    │
│   Main Workflow: 5 steps (signup → verify → profile → org → ...) │
│   Acceptance Criteria: 3 items (90% < 3 min, mobile + desktop, │
│                         async email queue)                      │
│   Out of Scope: SSO integration, bulk user import               │
│   ───────────────────────────────────────────────────────────── │
│                                                                  │
│   Ambiguity Flags (2 found):                                     │
│   ⚠ "< 3 minutes" – needs baseline network speed                │
│     Questions: [1] Standard broadband? [2] Includes email time? │
│   ⚠ "See dashboard" – which dashboard?                          │
│     Questions: [1] User or admin dashboard?                     │
│                                                                  │
│   UX Suggestions:                                                │
│   📐 4-step mobile-first flow, reuse LoginForm component        │
│   [View Full UX Suggestion]                                      │
│   ───────────────────────────────────────────────────────────── │
│                                                                  │
│   [ACCEPT] [REJECT] [MODIFY] [MORE CONTEXT]                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 BA Actions on AI Proposals

#### Accept
- Creates a `RequirementVersion` in DRAFT status
- Links AIExtraction as a source artifact ("AI-Generated from Recording")
- Copies all extracted fields into the requirement
- Logs: "BA_ACCEPTED_AI_PROPOSAL" with BA user ID, timestamp
- Next step: BA can now submit requirement for PM review

#### Modify
- Opens an edit form pre-filled with AI-extracted data
- BA can update any field: title, objective, acceptance criteria, scope, etc.
- After edits, BA clicks "ACCEPT AS MODIFIED"
- Logs: "BA_MODIFIED_AI_PROPOSAL" with diff of changes
- All modifications are visible in requirement version history

#### Reject
- Opens a dialog: "Why are you rejecting this proposal?"
- Reason options: "Low quality", "Incomplete", "Out of scope for this project", "Off-topic", "Other"
- If "Other", BA provides text
- Logs: "BA_REJECTED_AI_PROPOSAL" with reason, timestamp
- Extraction remains in audit log; not deleted
- Recommended action: BA manually creates requirement, or records new meeting

#### More Context
- Plays the recording segment that led to this extraction
- Shows the full transcript with speaker attribution and timestamps
- BA can jump to a specific time in the recording to hear surrounding conversation

### 2.3 Clarification Response Workflow

**Where**: "Clarifications – AI-Flagged" section in Requirement Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ Clarifications – AI-Flagged (2 pending response)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ✓ "< 3 minutes" – how is this measured?                         │
│   Status: OPEN                                                   │
│   AI Confidence in Ambiguity: 92%                               │
│   Suggested Questions:                                           │
│   1. Is this measured on standard broadband (5 Mbps+)?          │
│   2. Does this include email delivery time?                    │
│   3. Is 90% of users a hard SLA or a goal?                     │
│                                                                  │
│   Historical Context: Similar term "fast" in req_456 was        │
│   resolved to "< 2 sec response time"                          │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ Your Response:                                           │  │
│   │ The 3-minute target is measured on standard broadband    │  │
│   │ (≥ 5 Mbps). It includes only user actions (form fill,   │  │
│   │ clicks); email delivery is not counted in the 3 minutes. │  │
│   │ This is a goal, not an SLA—90% is our target but not    │  │
│   │ contractual.                                             │  │
│   │                                                           │  │
│   │ [SUBMIT RESPONSE]                                       │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ✓ "See dashboard" – which dashboard?                            │
│   Status: OPEN                                                   │
│   ...                                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**BA Action**: Type clarification response → SUBMIT
- Links response to Clarification record
- Logs: "BA_CLARIFIED" with timestamp
- Requirement can now move forward with ambiguities resolved

### 2.4 Acceptance Criteria Suggestions
When editing acceptance criteria, AI offers auto-complete suggestions based on:
- Historical acceptance criteria from similar requirements
- Industry best practices (e.g., "Page load < 2 sec", "Mobile + desktop")
- Project glossary and past clarifications

---

## 3. PROJECT_MANAGER Surface

### 3.1 Change Impact Dashboard

**Where**: "Changes & Impact – AI Analysis" section in Project Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ Changes & Impact – AI Analysis (1 pending PM review)              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ✓ User Onboarding Flow – Change from v2 to v3                   │
│   Status: PROPOSED (from extraction_abc123)                     │
│   Changed From: req_v12 (APPROVED, dated 2026-07-30)           │
│   ───────────────────────────────────────────────────────────── │
│                                                                   │
│   📋 SCOPE CHANGE: MEDIUM                                         │
│   New workflow step: Org connection (validated by domain)        │
│                                                                   │
│   💼 EFFORT IMPACT: +10 hours (confidence: 72%)                 │
│   • user-auth module: +2 hrs (email async queue)                │
│   • org-api module: +5 hrs (new API integration, MEDIUM risk)   │
│   • ui-onboarding module: +3 hrs (mobile responsiveness)        │
│                                                                   │
│   ⚠ RISKS:                                                        │
│   • Third-party org validation API is new (vendor integration)  │
│   • Mobile responsiveness adds complexity                        │
│   • Email async queue is new pattern in codebase                │
│                                                                   │
│   📊 HISTORICAL CONTEXT:                                          │
│   Similar requirement (req_456) was estimated at 12 hrs,        │
│   took 14 hrs (original estimate: 8 hrs). Scope grew 15%.       │
│                                                                   │
│   ✅ RECOMMENDED ACTIONS:                                         │
│   • Schedule design review before implementation                 │
│   • Verify org validation API contract with vendor              │
│   • Create spike for email async queue pattern                  │
│   ───────────────────────────────────────────────────────────── │
│                                                                   │
│   [APPROVE CHANGE] [REQUEST MORE ANALYSIS] [HOLD]               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 PM Actions on Change Impact Analysis

#### Approve Change
- Creates a Change Request (manual follow-up still needed for business approval)
- Effort impact is pre-filled from AI analysis
- Logs: "PM_APPROVED_CHANGE_IMPACT"
- Change request workflow proceeds normally (PM → BA → CTO review)

#### Request More Analysis
- Re-runs Change Impact Agent with feedback
- Example feedback: "Focus on third-party API integration risks" or "Get actual org-api team estimate"
- AI re-analyzes and provides revised impact summary

#### Hold
- Marks ChangeImpact as HOLD (doesn't create Change Request)
- Reason: PM waits for more context or decides change is not viable
- Change can be un-held later if decision changes

### 3.3 Sprint Burndown (Auto-Generated)

**Where**: "Sprint Burndown – AI-Updated" in Project Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ Sprint 15 Burndown – AI-Updated (last updated 30 min ago)        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Task Status Breakdown:                                            │
│ • Completed: 6 / 40 (15%)                                        │
│ • In Progress: 8 / 40 (20%)                                      │
│ • To Do: 26 / 40 (65%)                                           │
│                                                                   │
│ Burndown Curve:                                                   │
│ Ideal: ─────────────  (40 → 0 over 10 days)                     │
│ Actual: ════════════  (40 → 26 after 3 days, on pace)          │
│                                                                   │
│ Blockers (3):                                                     │
│ 1. Org API Integration – waiting on vendor API key               │
│ 2. Onboarding UI – waiting on design review approval             │
│ 3. Requirement clarification – "See dashboard" ambiguity         │
│                                                                   │
│ At-Risk Tasks (2):                                                │
│ 1. Email Async Queue – estimate 3 hrs, no owner assigned        │
│ 2. Mobile Responsiveness – estimate 3 hrs, high complexity       │
│                                                                   │
│ Velocity Forecast:                                                │
│ Sprint avg velocity: 38 pts                                       │
│ This sprint (current): 36 pts (on pace to match)                │
│ Forecasted completion: Aug 5 (on schedule)                      │
│                                                                   │
│ 💡 Insights from AI:                                              │
│ • Sprint is on track; no rework detected                        │
│ • Two blockers identified 3 hours earlier than team would have  │
│ • One at-risk task could benefit from pair programming         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

The burndown is **read-only** for PM; actual task completion is manual. AI just aggregates task status and highlights anomalies.

### 3.4 Risk & Change Request Queue

**Where**: "Risk & Requests – Pending" in Project Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ Risk & Change Requests – Pending (5 items)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 🚨 HIGH RISK – Third-party org validation API integration       │
│    (flagged by Change Impact Agent)                              │
│    Mitigation: Schedule design review, verify API contract      │
│    [View change request]                                         │
│                                                                   │
│ ⚠ MEDIUM RISK – Email async queue is new pattern                │
│    (flagged by Change Impact Agent)                              │
│    Mitigation: Create spike to evaluate existing solutions       │
│    [View change request]                                         │
│                                                                   │
│ 📋 CHANGE REQUEST – Org connection step (new workflow)          │
│    Impact: +10 hours                                             │
│    Status: PROPOSED (AI-generated)                              │
│    [Review] [Approve] [Defer]                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. DEVELOPER Surface

### 4.1 Task Assignment & Auto-Estimate Queue

**Where**: "My Tasks – AI-Suggested" in Developer Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ My Tasks – AI-Suggested (2 new, estimated)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ✓ Implement Email Verification Async Queue                      │
│   Requirement: User Onboarding Flow (req_v12)                  │
│   Estimated: 3 hours (AI: 72% confidence)                       │
│   Priority: HIGH                                                  │
│   Status: NOT_STARTED                                            │
│                                                                   │
│   Suggested Subtasks:                                            │
│   • Set up queue infrastructure (1.5 hrs)                        │
│   • Write verification email handler (1 hr)                     │
│   • Add tests (0.5 hrs)                                          │
│                                                                   │
│   [ACCEPT ESTIMATE] [ADJUST ESTIMATE] [ACCEPT TASK]            │
│   ───────────────────────────────────────────────────────────── │
│                                                                   │
│ ✓ Integrate Org Validation API                                  │
│   Requirement: User Onboarding Flow (req_v12)                  │
│   Estimated: 4 hours (AI: 68% confidence)                       │
│   Priority: HIGH                                                  │
│   Status: BLOCKED (waiting on org_api team)                     │
│                                                                   │
│   Blockers:                                                       │
│   • Vendor API key not yet provided                              │
│   • Org validation API contract needs review                     │
│   Unblock: Notify PM for vendor follow-up                        │
│                                                                   │
│   [ACCEPT ESTIMATE] [ADJUST ESTIMATE]                           │
│   ───────────────────────────────────────────────────────────── │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Developer Actions on AI-Suggested Tasks

#### Accept Estimate
- Acknowledges AI-suggested effort; uses it in sprint planning
- Logs: "DEVELOPER_ACCEPTED_ESTIMATE"
- Developer can now ACCEPT TASK to start work

#### Adjust Estimate
- Opens estimate editor
- Developer provides their own estimate (if they think AI is off)
- Logs: "DEVELOPER_ADJUSTED_ESTIMATE" with old and new values
- AI learns from this feedback (used in future model training)

### 4.3 Daily Digest (Standup Digest Agent)

**Where**: Slack / Email, sent at 9 AM

```
Good morning dev_dev1! Here's your TeamFlow standup for Project Onboarding (Aug 2, 2026):

📋 YOUR TASKS (4)
✓ Completed: 1 task (Email verification module, 3 hrs spent vs. 3 hrs estimated)
⏳ In Progress: 2 tasks (Org API integration, Email async queue - no blockers)
⏱ To Do: 1 task (Mobile responsiveness testing, starts tomorrow)

🚨 YOUR BLOCKERS (1)
- Org API Integration blocked on vendor API key
  → PM has been notified; expected response Aug 2 EOD

💬 CLARIFICATIONS WAITING (1)
- Requirement "Onboarding Flow" needs BA clarification on "dashboard display"
  → Response expected by EOD; may affect UI task scope

📊 TEAM NEWS (1 item affecting you)
- QA team flagged a defect in LoginForm component (req_v5)
  → Your org validation task may depend on LoginForm refactoring
  → Check defect PRJ-456 for details

✏ UPDATE YOUR STATUS
   Reply in Slack or log time in TeamFlow
```

---

## 5. QA_ENGINEER Surface

### 5.1 Test Case Review Queue

**Where**: "Test Cases – AI-Generated" in QA Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ Test Cases – AI-Generated (1 pending QA review)                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ✓ User Onboarding Flow – Test Case Suite                        │
│   Requirement: req_v12 (APPROVED)                               │
│   Status: DRAFT (AI-generated)                                  │
│   Estimated Total Execution Time: 15 minutes                    │
│   ───────────────────────────────────────────────────────────── │
│                                                                   │
│   Test Cases (7 total):                                          │
│                                                                   │
│   ✓ Happy Path: New user completes onboarding                   │
│     GHERKIN: Given new user → When completes all steps → Then  │
│     sees dashboard & time < 3 min                               │
│     Automatable: Yes (Playwright)                               │
│     Est. Time: 2 min                                             │
│     [ACCEPT] [MODIFY] [DELETE]                                 │
│                                                                   │
│   ✓ Error Path: Invalid organization domain                     │
│     GHERKIN: Given invalid domain → When clicks Validate →      │
│     Then sees error message & remains on org step               │
│     Automatable: Yes (Playwright)                               │
│     Est. Time: 1 min                                             │
│     [ACCEPT] [MODIFY] [DELETE]                                 │
│                                                                   │
│   ✓ Accessibility: Mobile layout (iOS)                          │
│     GHERKIN: Given iPhone 12 → When navigates flow → Then       │
│     all inputs visible, touch targets ≥ 48x48 dp                │
│     Automatable: No (requires manual QA)                        │
│     Est. Time: 5 min                                             │
│     [ACCEPT] [MODIFY] [DELETE]                                 │
│                                                                   │
│   [ACCEPT ALL] [REJECT ALL] [CUSTOM SELECTION]                 │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 QA Actions on AI-Generated Test Cases

#### Accept
- Moves test case to ACCEPTED status
- Test case is now linked to RequirementVersion
- QA can execute test case immediately (or schedule for later)
- Logs: "QA_ACCEPTED_TEST_CASE"

#### Modify
- Opens test case editor
- QA can refine GHERKIN syntax, change automation flag, adjust estimated time
- After edits: clicks ACCEPT
- Logs: "QA_MODIFIED_TEST_CASE" with changes

#### Delete
- Marks test case as deleted (not removed from audit log)
- Reason: QA determines coverage is unnecessary or duplicate
- Logs: "QA_DELETED_TEST_CASE" with reason

#### Custom Selection
- QA can accept some test cases and reject others
- Useful if AI over-generated or missed nuances
- Example: accept automatable cases, manually create edge-case cases

### 5.3 Requirement Testability Review

**Before BA submits a requirement for approval**, QA can review it and flag testability concerns:

```
┌──────────────────────────────────────────────────────────────────┐
│ Testability Review – User Onboarding Flow (req_v12, DRAFT)       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ✅ TESTABLE: This requirement has clear acceptance criteria     │
│                                                                   │
│ Issues Found (0):                                                 │
│ (None – no vague acceptance criteria)                            │
│                                                                   │
│ Suggested Test Gaps:                                             │
│ • Network timeout scenario (what if email service is down?)     │
│ • Concurrent user scenario (multiple users onboarding at once)  │
│ • Retry logic for failed org validation                         │
│                                                                   │
│ Coverage Estimate: 7 automated + 3 manual test cases            │
│ Estimated QA Time: 30 minutes per release                       │
│                                                                   │
│ [FLAG TESTABILITY CONCERN] [APPROVE FOR SUBMISSION]             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. CTO / MANAGEMENT Surface

### 6.1 Portfolio Health Dashboard

**Where**: Executive Dashboard, read-only

```
┌──────────────────────────────────────────────────────────────────┐
│ Portfolio Health – AI-Aggregated (as of 2026-08-02 4:00 PM)      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 📊 REQUIREMENTS CAPTURE                                           │
│ • Total requirements (all projects): 247                         │
│ • AI-assisted: 127 (51%)                                         │
│ • Manual entry: 120 (49%)                                        │
│ • Trend: AI adoption +15% this quarter                          │
│                                                                   │
│ 📝 AI EXTRACTION QUALITY                                         │
│ • Avg confidence score: 0.83 (target: > 0.80) ✓                │
│ • BA acceptance rate: 84% (target: > 80%) ✓                    │
│ • Rejection rate: 12% (target: < 20%) ✓                         │
│ • Rework rate: 4% (BA modifies AI output)                       │
│                                                                   │
│ 🚨 RISK & CHANGE REQUESTS                                        │
│ • Open change requests: 8                                        │
│ • High-risk changes: 2 (third-party API, new email pattern)   │
│ • Avg approval cycle time: 2.5 days                              │
│ • Blocked due to clarifications: 1 (waiting on BA response)     │
│                                                                   │
│ ⏱ DELIVERY VARIANCE                                              │
│ • Requirements on-time: 91% (target: > 90%) ✓                   │
│ • Tasks on-time: 87% (target: > 90%) ⚠                         │
│ • QA cycle time: 3.2 days avg                                    │
│ • Rework rate: 8% (AI-assisted reqs: 6%, manual: 10%)          │
│                                                                   │
│ 💰 AI ROI                                                         │
│ • Cost/month: $2,400 (AI agent compute)                         │
│ • BA time saved: ~40 hours/month (manual transcription)         │
│ • BA hourly rate: $100/hr → $4,000 value/month                 │
│ • ROI: +67% (savings exceed costs)                              │
│                                                                   │
│ 📉 TRENDS                                                         │
│ • Rework is down 12% since AI adoption (July vs. June)          │
│ • Clarification response time: down 2 days (async Q&A)          │
│ • First-pass requirement quality: up 8% (confidence correlation) │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Agent Performance Dashboard

**Where**: Engineering / AI Team Only

```
┌──────────────────────────────────────────────────────────────────┐
│ Agent Performance – Engineering View (last 7 days)               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Requirement Extraction Agent                                     │
│ • Calls: 42  Success: 41  Errors: 1 (timeout)                  │
│ • Avg confidence: 0.85  Acceptance rate: 86%                   │
│ • Avg latency: 8.3 sec  Cost/call: $0.045                      │
│ • Top error type: Low confidence (<0.70), 5 instances          │
│                                                                   │
│ Change Impact Agent                                              │
│ • Calls: 8  Success: 8  Errors: 0                              │
│ • Accuracy vs. manual estimates: 78% within ±20%                │
│ • Avg latency: 12.1 sec  Cost/call: $0.089                     │
│                                                                   │
│ Test Case Generator Agent                                        │
│ • Calls: 12  Success: 11  Errors: 1 (invalid GHERKIN)         │
│ • QA acceptance rate: 92%  Coverage adequacy: 89%              │
│ • Avg latency: 15.2 sec  Cost/call: $0.125                     │
│                                                                   │
│ Token Usage (weekly):                                            │
│ • Input tokens: 1.2M  Output tokens: 892K                      │
│ • Model: Claude Opus 5 (100%), cost: $48                       │
│                                                                   │
│ [View Logs] [Tune Thresholds] [Fine-tune Model?]               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Notification & Alert Strategy

### 7.1 Role-Based Notifications

| Role | Event | Channel | Urgency |
|---|---|---|---|
| **BA** | AI proposal ready for review | In-app + Slack | Normal |
| **BA** | Clarification auto-flagged | In-app + Email | Normal |
| **PM** | Change impact analysis ready | In-app + Slack | Normal |
| **PM** | High-risk change detected | In-app + Slack + Email | High |
| **Dev** | Task assigned (AI-suggested) | In-app + Email | Normal |
| **Dev** | Task blocked (AI-detected) | In-app + Slack | High |
| **QA** | Test case suite ready for review | In-app + Email | Normal |
| **QA** | Testability concern flagged | In-app + Slack | Normal |
| **CTO** | Portfolio metrics updated (daily) | Email digest | Low |
| **CTO** | Agent error rate spike | Slack + PagerDuty | Critical |

### 7.2 Notification Frequency

- **Real-time**: Blockers, high-risk changes, critical errors
- **Hourly digest**: Task status updates, minor AI completions
- **Daily digest**: Standup summaries, portfolio metrics, agent health
- **Weekly digest**: Trend analysis, AI ROI, team velocity

---

## 8. Feedback Loop (AI Learns from Humans)

Every human action on AI output is logged and used to improve future extractions:

- **BA rejects a requirement** → AI learns what caused rejection; feedback is used to adjust confidence score on similar future extractions
- **BA modifies an AI extraction** → Diff is logged; AI can learn from the delta
- **Dev adjusts an AI estimate** → New data point added to effort model
- **QA modifies test case** → AI learns about real-world testability gaps

This data is aggregated monthly and used to:
- Retrain or fine-tune agent models
- Adjust confidence thresholds
- Identify systematic gaps (e.g., "AI always underestimates mobile work")

---

## 9. Audit Trail for All AI Actions

Every AI-driven action is logged with:
- `timestamp`, `userId` (if human review), `agentId` (if AI)
- `action_type` (PROPOSED, ACCEPTED, REJECTED, MODIFIED)
- `confidence_score`, `model_id`, `tokens_used`
- `reason` (if rejected/modified)
- `output_artifact_id` (link to what was created/modified)

Example audit log entry:
```json
{
  "id": "audit_12345",
  "timestamp": "2026-08-02T14:12:00Z",
  "eventType": "AI_EXTRACTION_CREATED",
  "agentType": "REQUIREMENT_EXTRACTION",
  "extractionId": "extraction_abc123",
  "transcriptId": "transcript_abc123",
  "confidence": 0.87,
  "modelId": "claude-opus-5",
  "inputTokens": 4250,
  "outputTokens": 892,
  "status": "PROPOSED"
}
```

Followed by:
```json
{
  "id": "audit_12346",
  "timestamp": "2026-08-02T16:30:00Z",
  "eventType": "BA_ACCEPTED_EXTRACTION",
  "extractionId": "extraction_abc123",
  "userId": "user_ba1",
  "changesApplied": ["acceptanceCriteria"],
  "resultingRequirementId": "req_v12",
  "resultingStatus": "DRAFT"
}
```

---

## 10. Configuration by Organization

Different organizations may want:
- Different confidence thresholds
- Different notification channels (Slack vs. email vs. SMS)
- Different approval workflows (some may auto-approve low-risk changes)
- Different role-based surfaces (e.g., a startup might not have QA; a large enterprise might have multiple CTO dashboards)

**Recommendation**: Expose a configuration panel (for SYSTEM_ADMIN) to customize all of the above.
