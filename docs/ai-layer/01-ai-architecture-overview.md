# TeamFlow AI Layer Architecture

## 1. Executive Summary

The AI layer automates capture, transcription, structuring, and drafting while preserving TeamFlow's core principle: **nothing becomes canonical without human approval**. AI output always remains `PROPOSED` status until explicitly accepted by authorized users. This layer enhances efficiency without bypassing the approval gates that make TeamFlow trustworthy.

The AI layer is not a replacement for the approval workflow—it is a pre-workflow service layer that eliminates tedious manual transcription and structuring, so reviewers can focus on judgment calls rather than data entry.

## 2. Design Principles

- **Evidence over opinion**: AI output is versioned, stored with confidence scores, and traceable back to source (recording timestamp, transcript segment, model version)
- **Humans hold approval authority**: AI proposals are `PROPOSED` status in all contexts; only explicit human action promotes them to `ACCEPTED` or moves them through workflow states
- **Immutable audit trail**: Every AI-generated artifact includes model ID, prompt, timestamp, and confidence; rejected AI proposals remain in the audit log
- **Separation of concerns**: Narrow, single-purpose agents (one LLM call per agent) rather than one mega-agent; each output is independently reviewable
- **Role-based automation surfaces**: Different roles see different automation; a PM sees auto-generated burndown, a BA sees clarification-question drafts
- **Graceful degradation**: If AI extraction fails or confidence is too low, the work flows to a human review queue rather than silently inserted

## 3. Core Architecture

### 3.1 Voice-to-Requirement Pipeline

```
Meeting/Call Audio
    ↓
[Recorder Service] ──→ Audio storage + metadata
    ↓
[Speech-to-Text Service] ──→ Language detection, continuous transcription
    ↓
[Diarization Agent] ──→ Speaker attribution (who said what)
    ↓
[Transcript Storage] ──→ Raw, immutable, timestamped
    ↓
[AI Agent Pipeline] (see §4)
    ├─→ [Requirement Extraction Agent]
    ├─→ [Ambiguity Detector Agent]
    ├─→ [UX Gap-Filler Agent]
    └─→ [Change Impact Agent]
    ↓
[AIExtraction Records] (status = PROPOSED, pending human approval)
    ↓
[Human Review Queue]
    ├─ BA reviews requirement drafts → ACCEPTED / REJECTED / MODIFIED
    ├─ PM reviews impact analysis → ACCEPTED / FLAGGED
    └─ QA reviews test-case suggestions → ACCEPTED / SKIPPED
    ↓
[Workflow Entry Points]
    ├─→ RequirementVersion (DRAFT) ──→ approval workflow
    ├─→ Clarification (open) ──→ BA response queue
    └─→ ChangeImpact (logged) ──→ executive dashboards
```

### 3.2 Data Model Additions

All AI-related entities include:
- `createdAt`, `updatedAt` timestamps
- `createdBy` (AI agent ID, not a user)
- `modelVersion` (Claude 5, Opus, Haiku, etc.)
- `confidence` score (0–1)
- `status` enum: `PROPOSED | ACCEPTED | REJECTED | MODIFIED | EXPIRED`
- `reviewedBy`, `reviewedAt` (null until human action)

#### Recording
```json
{
  "id": "recording_abc123",
  "projectId": "proj_xyz",
  "meetingType": "REQUIREMENTS_KICKOFF | STAKEHOLDER_SYNC | DESIGN_REVIEW",
  "participants": ["user_ba1", "user_dev1"],
  "audioUrl": "s3://bucket/recordings/recording_abc123.mp3",
  "durationSeconds": 3600,
  "language": "en-US",
  "createdAt": "2026-08-02T14:00:00Z",
  "status": "PROCESSING | COMPLETE"
}
```

#### Transcript
```json
{
  "id": "transcript_abc123",
  "recordingId": "recording_abc123",
  "rawText": "full raw transcript...",
  "speakerSegments": [
    {
      "speaker": "Speaker_1 (identified as: user_ba1)",
      "timeRange": "00:00:00–00:05:30",
      "text": "segment text...",
      "confidence": 0.95
    }
  ],
  "overallConfidence": 0.92,
  "language": "en-US",
  "wordCount": 4250,
  "createdAt": "2026-08-02T14:10:00Z",
  "status": "COMPLETE"
}
```

#### AIExtraction
```json
{
  "id": "extraction_abc123",
  "transcriptId": "transcript_abc123",
  "extractionType": "REQUIREMENT_DRAFT | CLARIFICATION | DECISION | ACTION_ITEM | RISK",
  "payload": {
    // structure depends on extractionType (see §5)
  },
  "confidence": 0.87,
  "modelId": "claude-opus-5",
  "prompt": "You are a BA extracting requirements...",
  "status": "PROPOSED",
  "reviewedBy": null,
  "reviewedAt": null,
  "createdAt": "2026-08-02T14:12:00Z"
}
```

#### ChangeImpact
```json
{
  "id": "impact_abc123",
  "oldVersionId": "req_v12",
  "newExtractionId": "extraction_abc123",
  "projectId": "proj_xyz",
  "diffSummary": {
    "fieldsChanged": ["acceptanceCriteria", "actors"],
    "linesAdded": 15,
    "linesRemoved": 3
  },
  "affectedModules": ["user-auth", "dashboard"],
  "effortDelta": "+8 hours",
  "effortConfidence": 0.78,
  "risk": "MEDIUM",
  "status": "PROPOSED",
  "createdAt": "2026-08-02T14:14:00Z"
}
```

## 4. Agent Roles

Each agent is a narrow, focused LLM call producing structured JSON output. Agents do not communicate with each other; all outputs are independent and reviewed separately.

| Agent | Input | Output | Produces | Status |
|---|---|---|---|---|
| **Transcription** | Raw audio | Diarized transcript | `Transcript` | COMPLETE |
| **Requirement Extraction** | Transcript | Draft obj., actors, workflow, rules, scope | `AIExtraction` (type=REQUIREMENT_DRAFT) | PROPOSED |
| **Ambiguity Detector** | Transcript + draft requirement | Flagged vague terms + clarifying questions | `AIExtraction` (type=CLARIFICATION) | PROPOSED |
| **UX Gap-Filler** | Requirement + industry patterns | Wireframe suggestions, flow diagrams | Attached as artifact to AIExtraction | PROPOSED |
| **Change Impact** | New extraction vs. old approved version | Diff, affected modules, effort delta | `ChangeImpact` | PROPOSED |
| **Task Breakdown** | Approved `RequirementVersion` | Suggested task list w/ estimates | `Task` (DRAFT) | DRAFT |
| **Test Case Generator** | Approved `RequirementVersion` + criteria | Draft test cases in GHERKIN format | `TestCase` (DRAFT) | DRAFT |
| **Standup Digest** | Task activity + AuditLog | Daily digest per role | Notification feed | N/A |

## 5. Human Review Surfaces

### 5.1 BA Dashboard: Requirement Review Queue
- Shows `AIExtraction` records with type=REQUIREMENT_DRAFT, status=PROPOSED
- Displays confidence score and source transcript timestamp
- Actions: ACCEPT (creates RequirementVersion in DRAFT, links AIExtraction), REJECT, MODIFY (drafts changes and re-submits)
- All actions are audit-logged; rejection includes reason

### 5.2 PM Dashboard: Impact Analysis
- Shows `ChangeImpact` records pending review
- Displays affected modules, effort delta, risk level
- Actions: APPROVE (change request can proceed), REQUEST_ANALYSIS (re-runs agent with feedback), HOLD
- Lower-confidence extractions are routed here automatically

### 5.3 QA Dashboard: Test Case Drafts
- Shows `TestCase` (DRAFT) records auto-generated from approved requirements
- Can review GHERKIN format, link to requirement version
- Actions: ACCEPT, MODIFY, DELETE (mark "manual coverage only")

### 5.4 Developer Task Queue
- Auto-assigned tasks from Task Breakdown Agent
- Shows estimated hours (auto-generated) and priority
- Can request clarification; flags go back to BA review queue

### 5.5 Executive Dashboards
- **Portfolio Health**: % requirements with AI-assisted capture, % change requests pending, delivery variance
- **Risk Summary**: high-confidence ambiguity flags, high-impact changes pending approval
- **Burndown**: auto-updated from task status (read-only for execs, but generated from AI)

## 6. Confidence Thresholds and Routing

AI extractions are routed based on confidence:

| Confidence | Routing | Action |
|---|---|---|
| ≥ 0.85 | Direct to assigned reviewer | Review normally |
| 0.70–0.84 | Flagged queue (high-touch review) | Human adds context, then review |
| < 0.70 | Human re-work queue | BA rewrites manually or requests clarification |

The threshold is configurable per agent and per organization.

## 7. Example: Requirements Kickoff Meeting

### 7.1 Scenario

- Friday 2 PM: 90-minute stakeholder meeting on a new user onboarding flow.
- Attendees: BA, PM, Product Designer, CTO, two stakeholders from Customer Success.
- Call is recorded and auto-transcribed in real-time (optional, users can mute).

### 7.2 AI Workflow (happens ~15 min after meeting ends)

1. **Diarization Agent** identifies 5 speakers and timestamps who said what
2. **Requirement Extraction Agent** generates a draft requirement:
   ```json
   {
     "title": "User Onboarding Flow – Profile Setup Module",
     "objective": "Reduce time-to-first-value for new users from 8 minutes to < 3 minutes",
     "actors": ["New User", "Customer Success Manager"],
     "mainWorkflow": ["Sign up → Verify email → Create profile → Connect org → See dashboard"],
     "businessRules": [
       "Profile picture is optional",
       "Org connection must validate domain",
       "CSM can trigger guided tour"
     ],
     "acceptanceCriteria": [
       "Flow completes in < 3 min 90% of the time",
       "Mobile and desktop supported",
       "Offline email verification queue added"
     ],
     "outOfScope": ["SSO integration (deferred)", "Bulk user import"]
   }
   ```
3. **Ambiguity Detector** flags:
   - "< 3 minutes" — baseline measurement needed; confidence varies by network speed
   - "See dashboard" — which dashboard? Admin or user dashboard?
   - "Offline email verification queue" — was this a definite requirement or a suggestion?
   - Auto-generated clarification questions for BA to address

4. **UX Gap-Filler** suggests:
   - Wireframe: mobile-first onboarding with 4-step progress bar
   - Accessibility note: WCAG 2.1 AA compliance recommended
   - Suggested component reuse: LoginFlow exists; can wrap

5. **Change Impact Agent** compares to existing "User Signup (v3)" requirement:
   - New requirement expands scope (org connection added)
   - Effort delta: +5–8 hours (if UI designer is involved)
   - Risk: medium (new third-party org-validation API)

### 7.3 BA Review (Monday morning)

BA opens the review queue:
- Reads the extracted requirement (auto-summarized from 90-min recording)
- Reviews the clarification questions
- Accepts the requirement with minor edits: "< 3 minutes" becomes "< 3 minutes for standard broadband (≥ 5 Mbps)"
- AIExtraction is marked ACCEPTED; RequirementVersion is created in DRAFT
- Requirement is now ready for submission → PM review

### 7.4 Audit Trail

The requirement's history includes:
- Recording (immutable)
- Transcript (immutable, with diarization)
- AIExtraction (PROPOSED)
- AIExtraction (ACCEPTED after BA edit)
- RequirementVersion v1 (DRAFT, auto-linked to AIExtraction)
- All decisions logged with timestamps and user IDs

If the AI had mis-heard something, the BA's edit is visible; if a stakeholder later disputes the requirement, the BA and CTO can replay the exact timestamp in the recording and see the transcript segment that led to the extraction.

## 8. Integration Points with Existing Workflows

- **Requirement Workflow**: AIExtraction feeds into RequirementVersion creation; the proposal is added as a linked artifact
- **Change Management**: ChangeImpact proposals inform Change Request creation; impact analysis is pre-filled
- **QA Workflow**: TestCase proposals are reviewed before linking to RequirementVersion
- **Task Management**: Task Breakdown Agent only runs on APPROVED requirements; drafts are visible but not in the active task queue
- **Audit Log**: Every AI action is logged with model ID, confidence, human review outcome, and rejection reason (if any)

## 9. Security and Governance Constraints

- **No silent approval**: AI output never auto-transitions workflow states; human action is always required
- **No credential entry**: Transcripts do not include passwords, API keys, or PII capture; if detected, sanitized from storage
- **PII handling**: Transcripts are org-scoped; only assigned project members see them; legal teams can request deletion
- **Transparency**: Executives can audit % of requirements captured via AI vs. manual, confidence distributions, rejection rates per agent
- **Cost transparency**: Each agent call logs token usage; dashboards show cost per project, cost per requirement, ROI vs. manual BA effort

## 10. Non-Goals (Out of Scope)

- **Auto-approval**: AI does not approve requirements, change requests, or releases
- **Replacement of human judgment**: AI generates structure and flags ambiguity; humans make the call
- **Real-time meeting transcription visibility**: Raw transcripts may be stored but not shown live to meeting participants (UX clutter; BAs review asynchronously)
- **Chatbot as a single source of truth**: General-purpose chat is separate from governed project data
- **Automatic remediation of compliance issues**: Compliance flagging is automated; fixing is manual
