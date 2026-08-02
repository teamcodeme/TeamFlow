# TeamFlow AI Agents – Detailed Specifications

## 1. Overview

Each agent is a focused LLM service that takes structured input and produces JSON output. Agents run independently; orchestration happens via queues and event logs, not direct agent-to-agent calls.

## 2. Transcription Agent

### 2.1 Purpose
Convert raw audio + diarization metadata into a searchable, timestamped transcript with speaker attribution.

### 2.2 Input
- `recordingId`: Reference to stored audio
- `language`: Detected or configured language code (e.g., "en-US")
- `participants`: List of user IDs present (optional; used for accurate speaker identification)

### 2.3 Output: Transcript
```json
{
  "id": "transcript_...",
  "recordingId": "recording_...",
  "rawText": "full transcript text",
  "speakerSegments": [
    {
      "speaker": "Speaker_1",
      "identifiedAs": "user_ba1",
      "timestamp": "00:00:00",
      "duration": "00:05:30",
      "text": "segment text",
      "confidence": 0.95
    }
  ],
  "overallConfidence": 0.92,
  "language": "en-US",
  "wordCount": 4250,
  "createdAt": "ISO8601",
  "status": "COMPLETE"
}
```

### 2.4 Success Criteria
- Speaker diarization confidence ≥ 0.80 (else flagged in transcript)
- Word error rate (WER) ≤ 0.05 for technical terms (requires domain lexicon for each project)
- Timestamp accuracy ± 0.5 seconds
- Detects and marks inaudible segments (silence, crosstalk, low SNR)

### 2.5 Failure Modes
- **Low SNR (< 20 dB)**: Mark segments as low-confidence; do not skip
- **Crosstalk**: Transcribe best-effort; flag segment with confidence < 0.60
- **Non-English languages**: Detect and process accordingly; mark if multi-language
- **Speaker identification ambiguity**: Use audio fingerprinting + historical voice samples; fall back to "Speaker_1", "Speaker_2"

### 2.6 Configuration
- Max audio duration: 240 minutes (scalable)
- Supported languages: English, Spanish, French, German, Japanese, Mandarin (configurable)
- Re-run threshold: Transcript is immutable once COMPLETE; corrections require manual annotation

---

## 3. Requirement Extraction Agent

### 3.1 Purpose
Draft a structured requirement from a transcript, inferring business objective, actors, workflows, rules, scope, and acceptance criteria.

### 3.2 Input
```json
{
  "transcriptId": "transcript_...",
  "projectContext": {
    "projectId": "proj_xyz",
    "existingRequirements": [
      {
        "id": "req_123",
        "title": "...",
        "status": "APPROVED",
        "version": 3
      }
    ],
    "domainGlossary": {
      "term": "definition"
    }
  }
}
```

### 3.3 Output: AIExtraction (type=REQUIREMENT_DRAFT)
```json
{
  "id": "extraction_...",
  "transcriptId": "transcript_...",
  "extractionType": "REQUIREMENT_DRAFT",
  "payload": {
    "title": "User Onboarding Flow – Profile Setup Module",
    "businessObjective": "Reduce time-to-first-value for new users from 8 min to < 3 min",
    "actors": [
      {
        "role": "New User",
        "description": "User signing up for the first time"
      },
      {
        "role": "Customer Success Manager",
        "description": "Internal team supporting onboarding"
      }
    ],
    "mainWorkflow": [
      "1. User signs up with email",
      "2. Email verification link sent",
      "3. User creates profile (name, picture optional)",
      "4. User connects organization (by domain)",
      "5. User sees dashboard"
    ],
    "alternativeWorkflows": [
      {
        "trigger": "User already has organization account",
        "steps": ["Suggest join existing org", "Require invite token", "Skip profile setup"]
      }
    ],
    "businessRules": [
      "Profile picture is optional",
      "Org connection must validate against domain whitelist",
      "CSM can trigger guided tour on first login",
      "Duplicate emails are rejected"
    ],
    "acceptanceCriteria": [
      "Flow completes in < 3 min for 90% of users on standard broadband",
      "Mobile and desktop supported",
      "Email verification uses async queue (max 2-min delivery)"
    ],
    "outOfScope": [
      "SSO integration (scheduled for Q4)",
      "Bulk user import (separate Epic)"
    ],
    "assumptions": [
      "Email service is available (SLA 99%)",
      "Org database is responsive (< 100ms)"
    ],
    "dependencies": [
      "Email verification service (existing)",
      "Org validation API (new, medium complexity)"
    ],
    "nonFunctionalRequirements": [
      "Performance: Page load < 2 sec on 3G",
      "Accessibility: WCAG 2.1 AA",
      "Mobile: iOS 12+, Android 8+"
    ]
  },
  "confidence": 0.87,
  "sourceSegments": [
    {
      "speaker": "user_ba1",
      "timestamp": "00:02:30",
      "text": "...",
      "relevance": "core workflow"
    }
  ],
  "status": "PROPOSED",
  "createdAt": "ISO8601"
}
```

### 3.4 Success Criteria
- Confidence ≥ 0.75 for main workflow extraction
- Actors and roles clearly identified
- At least 3 acceptance criteria extracted
- Out-of-scope items identified and listed
- No hallucination of features not mentioned in transcript
- Alignment with project domain glossary (e.g., uses correct terminology)

### 3.5 Failure Modes
- **Insufficient context**: Transcript does not contain enough detail about requirements; confidence < 0.60 → routed to human re-work queue
- **Conflicting statements**: Transcript contains contradictory information; agent flags and includes both interpretations with confidence scores
- **Underspecified acceptance criteria**: Agent generates clarification questions instead of guessing
- **Domain mismatch**: Extracted requirement uses terminology inconsistent with project glossary; agent flags with suggestion

### 3.6 Configuration
- Confidence threshold for acceptance: 0.75 (configurable per organization)
- Max required fields to extract: 12 (title, objective, actors, workflows, rules, criteria, scope, assumptions, dependencies, NFRs)
- Domain glossary: auto-updated from approved requirement versions

---

## 4. Ambiguity Detector Agent

### 4.1 Purpose
Identify vague or underspecified terms in a requirement transcript or draft, generate clarifying questions, and auto-create Clarification records.

### 4.2 Input
```json
{
  "transcriptId": "transcript_...",
  "draftRequirementId": "extraction_...",
  "projectContext": {
    "historicalClarifications": [
      {
        "term": "fast",
        "resolution": "< 2 sec response time"
      }
    ]
  }
}
```

### 4.3 Output: AIExtraction (type=CLARIFICATION)
```json
{
  "id": "extraction_clarif_...",
  "transcriptId": "transcript_...",
  "extractionType": "CLARIFICATION",
  "payload": {
    "flaggedTerms": [
      {
        "term": "< 3 minutes",
        "context": "Flow completion time",
        "ambiguity": "Network speed affects perceived time; unclear if measured user action time or wall-clock time",
        "suggestedClarifications": [
          "Is this measured on standard broadband (5 Mbps+)?",
          "Does this include email delivery time or just user actions?",
          "Is 90% of users a hard SLA or a goal?"
        ],
        "historicalContext": "Similar term 'fast' was resolved to '< 2 sec response time' in req_456",
        "confidence": 0.92
      },
      {
        "term": "See dashboard",
        "context": "Final step in main workflow",
        "ambiguity": "Multiple dashboards exist: admin dashboard, user dashboard, analytics dashboard",
        "suggestedClarifications": [
          "Which dashboard should a new user see? (Admin/User/Analytics?)",
          "Should the dashboard be pre-populated with sample data?"
        ],
        "confidence": 0.88
      }
    ],
    "questionSummary": [
      "What is the baseline network speed for the < 3 minute target?",
      "Which dashboard should new users see first?"
    ]
  },
  "confidence": 0.90,
  "status": "PROPOSED",
  "createdAt": "ISO8601"
}
```

### 4.4 Success Criteria
- Identifies vague terms with > 80% precision (low false-positive rate)
- Generates 2–5 clarifying questions per vague term
- Links to historical clarifications where relevant
- Confidence score reflects term ambiguity (higher = more ambiguous)

### 4.5 Failure Modes
- **Over-flagging**: Agent flags every relative term (small, large, fast); mitigated by weighting against project glossary
- **Context misses**: Agent doesn't understand project domain and flags terms that are already defined; mitigated by providing glossary
- **Missed ambiguity**: Requirement is genuinely vague but agent doesn't flag; caught downstream in BA review

### 4.6 Configuration
- Vague-term lexicon (configurable per organization)
- Historical clarification lookback: 1 year
- Max flagged terms per requirement: 10
- Clarification auto-created in status=OPEN; BA responds with clarification text, and response is linked to requirement

---

## 5. UX Gap-Filler Agent

### 5.1 Purpose
Suggest UI/UX design patterns, wireframes, and component recommendations when a requirement lacks visual or interaction details.

### 5.2 Input
```json
{
  "requirementId": "extraction_...",
  "transcript": "...",
  "projectContext": {
    "existingComponents": [
      {
        "name": "LoginForm",
        "description": "Email + password form with validation"
      },
      {
        "name": "ProgressBar",
        "description": "Multi-step progress indicator"
      }
    ],
    "designSystem": "Material Design 3 | Tailwind",
    "accessibility": "WCAG 2.1 AA"
  }
}
```

### 5.3 Output: Artifact (attached to AIExtraction)
```json
{
  "type": "ux_suggestion",
  "payload": {
    "wireframeDescription": "4-step mobile-first onboarding:\n1. Email/Password (reuse LoginForm component)\n2. Profile (name + optional picture)\n3. Org Connection (domain input + validation feedback)\n4. Welcome (summary + CTA to dashboard)\nDesktop variant: same steps, card layout with progress bar on left side.",
    "suggestedComponents": [
      {
        "name": "LoginForm",
        "purpose": "Email + password entry in step 1",
        "reuseNote": "Existing component; no changes needed"
      },
      {
        "name": "ProgressBar",
        "purpose": "4-step progress indicator",
        "reuseNote": "Existing; configure with 4 steps"
      },
      {
        "name": "ImageUpload",
        "purpose": "Optional profile picture",
        "reuseNote": "New; similar to component used in settings flow"
      }
    ],
    "accessibilityNotes": [
      "Ensure keyboard navigation between steps",
      "Form labels must be associated with inputs (aria-label)",
      "Error messages must be associated with invalid fields (aria-describedby)",
      "Mobile viewport: ensure touch targets ≥ 48x48 dp"
    ],
    "mobileConsiderations": [
      "Stack all inputs vertically",
      "Use native date picker for date inputs (if any)",
      "Use native email keyboard on mobile"
    ],
    "designTokens": [
      "Primary color: [reference design system]",
      "Spacing: 16px baseline (4px grid)",
      "Font: [system font from design system]"
    ]
  },
  "confidence": 0.80,
  "createdAt": "ISO8601"
}
```

### 5.4 Success Criteria
- Suggests components that exist in design system 80% of the time
- Accessibility recommendations are WCAG 2.1 AA compliant
- Wireframe description is clear enough for designer to sketch without AI assistance
- No over-design (e.g., suggesting a custom component when a standard one exists)

### 5.5 Failure Modes
- **Missing design context**: Agent doesn't know project's design system; mitigated by providing design token reference
- **Over-suggestion**: Agent recommends new component when reuse is better; mitigated by scoring existing component fit first
- **Accessibility gaps**: Agent misses specific WCAG criterion; mitigated by explicit WCAG 2.1 AA validation in review

### 5.6 Configuration
- Design system reference (Material 3, Tailwind, Figma library URL)
- Accessibility standard (WCAG 2.1 AA by default)
- Target platforms (iOS, Android, Web; can be mixed)
- Existing components index (auto-fetched from Figma or component library)

---

## 6. Change Impact Agent

### 6.1 Purpose
Compare a new requirement extraction to an existing approved requirement, identify differences, estimate effort impact, and flag risks.

### 6.2 Input
```json
{
  "oldVersionId": "req_v12",
  "newExtractionId": "extraction_...",
  "projectContext": {
    "estimateHistory": [
      {
        "requirementId": "req_456",
        "originalEstimate": "8 hours",
        "actualTime": "10 hours",
        "notes": "Underestimated component reuse complexity"
      }
    ]
  }
}
```

### 6.3 Output: ChangeImpact (and AIExtraction for review)
```json
{
  "id": "impact_...",
  "oldVersionId": "req_v12",
  "newExtractionId": "extraction_...",
  "projectId": "proj_xyz",
  "diffSummary": {
    "fieldsChanged": [
      "acceptanceCriteria (added 1, removed 0)",
      "actors (no change)",
      "businessRules (added 2: duplicate email rejection, CSM tour trigger)"
    ],
    "textDiff": {
      "mainWorkflow": {
        "added": ["4. User connects organization (by domain)"],
        "removed": [],
        "modified": []
      }
    }
  },
  "impactAnalysis": {
    "scopeChange": "MEDIUM (new workflow step for org connection)",
    "affectedModules": [
      {
        "module": "user-auth",
        "reason": "Email verification changes (async queue)",
        "effortEstimate": "+2 hours",
        "risk": "LOW"
      },
      {
        "module": "org-api",
        "reason": "New org validation integration",
        "effortEstimate": "+5 hours",
        "risk": "MEDIUM (third-party API integration)"
      },
      {
        "module": "ui-onboarding",
        "reason": "New steps, mobile responsiveness",
        "effortEstimate": "+3 hours",
        "risk": "LOW"
      }
    ],
    "totalEffortDelta": "+10 hours",
    "effortConfidence": 0.72,
    "riskLevel": "MEDIUM",
    "riskFactors": [
      "Third-party org validation API is new integration",
      "Mobile responsiveness adds complexity",
      "Email async queue is new pattern in codebase"
    ]
  },
  "historicalContext": {
    "similarRequirements": [
      {
        "requirementId": "req_456",
        "similarity": 0.68,
        "originalEstimate": "12 hours",
        "actualTime": "14 hours",
        "deltaNote": "Scope grew 15% after stakeholder feedback"
      }
    ]
  },
  "recommendedActions": [
    "Schedule design review before implementation",
    "Verify org validation API contract with vendor",
    "Create spike for email async queue pattern"
  ],
  "status": "PROPOSED",
  "createdAt": "ISO8601"
}
```

### 6.4 Success Criteria
- Identifies all changed fields with > 95% accuracy (compared to manual diff)
- Effort estimate is within ±20% of actual (validated against historical data)
- Risk level matches CTO/PM assessment in post-mortems 75% of the time
- Identifies affected modules with no false positives (precision > 0.90)

### 6.5 Failure Modes
- **Underestimation of scope**: New requirement seems small but actually requires significant refactoring; mitigated by providing historical estimate variance data
- **Module misidentification**: Agent flags module as affected when it's not; caught in PM/CTO review
- **Risk blindness**: Agent misses a critical risk (e.g., third-party API sunset); mitigated by allowing CTO to override and provide reason

### 6.6 Configuration
- Historical estimate lookback: 2 years
- Effort estimate variance tolerance: ±20%
- Risk assessment model (can be customized per organization)
- Similarity threshold for historical lookups: 0.60

---

## 7. Task Breakdown Agent

### 7.1 Purpose
Only runs on APPROVED requirements. Suggests a task list with estimates and subtasks.

### 7.2 Input
```json
{
  "requirementVersionId": "req_v12",
  "projectContext": {
    "team": [
      {
        "userId": "user_dev1",
        "role": "DEVELOPER",
        "skills": ["React", "Node.js"],
        "currentWorkload": 32
      }
    ]
  }
}
```

### 7.3 Output: Task (DRAFT status) + AIExtraction
```json
{
  "id": "task_...",
  "requirementVersionId": "req_v12",
  "projectId": "proj_xyz",
  "title": "User Onboarding Flow – Implementation",
  "status": "DRAFT",
  "priority": "HIGH",
  "estimatedHours": 10,
  "estimateConfidence": 0.72,
  "suggestedOwner": "user_dev1",
  "subtasks": [
    {
      "title": "Implement email verification async queue",
      "owner": "user_dev1",
      "estimatedHours": 3,
      "dependencies": []
    },
    {
      "title": "Integrate org validation API",
      "owner": "user_dev1",
      "estimatedHours": 4,
      "dependencies": ["email verification"]
    },
    {
      "title": "Build onboarding UI (desktop + mobile)",
      "owner": null,
      "estimatedHours": 3,
      "dependencies": []
    }
  ],
  "aiGeneratedNote": "Estimates based on historical effort data and similar requirements. Subtask 'UI' requires designer; other subtasks are dev-only. Total assumes 1 developer; parallel work may reduce actual time.",
  "createdAt": "ISO8601"
}
```

### 7.4 Success Criteria
- Subtasks are independent or dependencies are clearly marked
- Estimated hours are within ±25% of actual (validated post-release)
- Suggested owner matches PM assignment 70% of the time
- No subtask is < 1 hour or > 16 hours (breaks scope too small or too large)

### 7.5 Failure Modes
- **Overly granular**: Subtasks are too small; mitigated by enforcing min 1-hour estimate
- **Missing subtasks**: Agent misses an obvious task; caught in developer estimation review
- **Poor owner suggestion**: Suggested owner doesn't have the skills; mitigated by consulting skills matrix

### 7.6 Configuration
- Historical estimate database (queries last 2 years of similar work)
- Skills matrix (auto-fetched from team profiles)
- Max subtasks per task: 10
- Effort estimate granularity: 0.5 hours

---

## 8. Test Case Generator Agent

### 8.1 Purpose
Only runs on APPROVED requirements. Generates test cases in GHERKIN format (Given-When-Then).

### 8.2 Input
```json
{
  "requirementVersionId": "req_v12",
  "acceptanceCriteria": [
    "Flow completes in < 3 min for 90% of users on standard broadband",
    "Mobile and desktop supported"
  ]
}
```

### 8.3 Output: TestCase (DRAFT status) + AIExtraction
```json
{
  "id": "test_...",
  "requirementVersionId": "req_v12",
  "projectId": "proj_xyz",
  "title": "User Onboarding Flow – Test Cases",
  "status": "DRAFT",
  "testCases": [
    {
      "scenario": "New user completes profile setup",
      "gherkin": "Given a new user on the signup page\nWhen the user enters email, password, profile name\nAnd clicks 'Next'\nAnd enters organization domain\nAnd clicks 'Connect'\nThen the user sees the dashboard\nAnd the total time elapsed is < 3 minutes",
      "type": "HAPPY_PATH",
      "automatable": true,
      "estimatedExecutionTime": "2 minutes"
    },
    {
      "scenario": "User provides invalid organization domain",
      "gherkin": "Given a user on the org connection step\nWhen the user enters 'invalid-domain.com'\nAnd clicks 'Validate'\nThen the user sees error message 'Domain not recognized'\nAnd the user remains on the org connection step",
      "type": "ERROR_PATH",
      "automatable": true,
      "estimatedExecutionTime": "1 minute"
    },
    {
      "scenario": "Flow renders correctly on mobile (iOS)",
      "gherkin": "Given a new user on iPhone 12 (Safari)\nWhen the user navigates through onboarding steps\nThen all form inputs are visible without horizontal scroll\nAnd touch targets are ≥ 48x48 dp",
      "type": "ACCESSIBILITY",
      "automatable": false,
      "estimatedExecutionTime": "5 minutes"
    }
  ],
  "estimatedTotalExecutionTime": "15 minutes",
  "aiGeneratedNote": "Test cases derived from acceptance criteria and main workflow. Non-automatable cases (accessibility, UI layout) require manual QA. Consider adding performance test for < 3 min SLA (requires load testing infrastructure).",
  "createdAt": "ISO8601"
}
```

### 8.4 Success Criteria
- At least 1 happy-path test case per workflow step
- At least 1 error-path test case per validation rule
- GHERKIN syntax is valid and executable (can be parsed by test framework)
- Automatable vs. manual classification matches QA's assessment 85% of the time

### 8.5 Failure Modes
- **Over-automation**: Agent suggests automating a test that is too brittle; caught in QA review
- **Missed scenarios**: Agent misses edge cases (e.g., network timeout, concurrent users); caught in QA review
- **Unmaintainable GHERKIN**: Syntax is invalid or too verbose; caught by parser

### 8.6 Configuration
- GHERKIN style guide (Given-When-Then format, max 10 steps per scenario)
- Automatable vs. manual heuristics (e.g., performance tests are manual unless load-testing framework exists)
- Test framework: Cucumber, Playwright, Selenium (configurable)

---

## 9. Standup Digest Agent

### 9.1 Purpose
Daily digest of task activity, blockers, at-risk items, and key decisions. Role-based output (developer gets their tasks, PM gets portfolio view).

### 9.2 Input
```json
{
  "role": "PROJECT_MANAGER",
  "projectId": "proj_xyz",
  "lookbackHours": 24
}
```

### 9.3 Output: Notification (sent to Slack/email)
```
Good morning! Here's your TeamFlow standup for Project Onboarding (Aug 2, 2026):

📊 SPRINT STATUS
- Sprint 15: 6 tasks complete, 8 in progress, 2 blocked
- Burndown: On pace (34 of 40 tasks done)
- Velocity: 38 pts avg (this sprint: 36 pts so far)

🚨 BLOCKERS (attention needed)
- Task "Org API Integration" blocked on vendor API key (assigned to @dev1)
  → Contact vendor support; blocking @dev1 and 1 dependent task
- Requirement "User Onboarding" needs clarification on org domain validation logic
  → BA to respond by EOD

🎯 RELEASES PENDING
- Release v1.2.0: 4 of 5 requirements delivered, 1 awaiting QA approval
  → Expected release: Aug 5

💡 KEY DECISIONS (last 24h)
- Approved change request: Add email async queue (impact: +2 hrs, low risk)
- Rejected change request: SSO integration (deferred to Q4, per CTO)

Questions? Reply in Slack or open requirement in TeamFlow.
```

### 9.4 Success Criteria
- All blockers are correctly identified (recall > 0.95)
- Summary is concise (< 200 words)
- Role-specific information is relevant to recipient's role
- Sent at consistent time each day (configurable, default 9 AM local time)

### 9.5 Configuration
- Send time: 9 AM (configurable per organization)
- Role-based summaries (PM, BA, Dev, QA have different summaries)
- Lookback window: 24 hours (or custom)
- Notification channel: Slack, email, or both

---

## 10. Orchestration and Error Handling

### 10.1 Agent Invocation Sequence

1. **Recording is marked COMPLETE** → Trigger Transcription Agent
2. **Transcript is COMPLETE** → Trigger Requirement Extraction Agent + Ambiguity Detector Agent (parallel)
3. **Requirement Extraction is PROPOSED** → Trigger UX Gap-Filler Agent (optional, if design is incomplete)
4. **Requirement Extraction is ACCEPTED by BA** → Trigger Change Impact Agent (if old version exists)
5. **Requirement is APPROVED** → Trigger Task Breakdown Agent + Test Case Generator Agent (parallel)
6. **Sprint/day ends** → Trigger Standup Digest Agent (scheduled, not event-based)

### 10.2 Error Handling
- **Timeout**: If an agent takes > 5 minutes, cancel and log error; notify admin
- **Low confidence**: If confidence < threshold, route to human review queue (see §5 in architecture doc)
- **API failure** (e.g., transcription service down): Retry up to 3 times with exponential backoff; if still failing, alert admin and mark Recording as FAILED
- **Invalid output**: If agent output doesn't match expected JSON schema, log error and route to human re-work queue

### 10.3 Cost Tracking
Every agent call logs:
- `modelId` (e.g., "claude-opus-5")
- `inputTokens`, `outputTokens`
- `duration` (wall-clock time)
- `status` (SUCCESS, TIMEOUT, INVALID_OUTPUT, API_ERROR)

Cost is aggregated per project, per agent, and per month for transparency.

---

## 11. Monitoring and Observability

### 11.1 Metrics
- **Extraction accuracy**: % of AI extractions that are accepted by human reviewer (target: > 80%)
- **Rejection rate**: % of AI outputs rejected, by agent type (target: < 20% per agent)
- **Confidence calibration**: % of high-confidence extractions (> 0.80) that are accepted (target: > 85%)
- **End-to-end time**: Time from recording completion to BA review (target: < 15 min)
- **Cost per requirement**: Average $ spent on AI agents per requirement (for ROI analysis)

### 11.2 Logging
All AI events are logged with:
- `timestamp`, `eventType` (PROPOSED, ACCEPTED, REJECTED)
- `agent_type`, `model_id`, `tokens_used`
- `confidence_score`, `user_id` (for human review actions)
- `reason` (if rejected)

Logs are retained for 2 years for audit and training purposes.

### 11.3 Dashboards
- **CTO**: Agent health, error rates, cost per project
- **PM**: Extraction accuracy, time-to-review, blocked items
- **BA**: Clarification rates, extraction quality, rejection reasons

---

## 12. Future Enhancements

- **Multi-language support**: Expand beyond English; maintain glossaries per language
- **Domain-specific fine-tuning**: Custom models for specialized domains (healthcare, fintech)
- **Feedback loop**: Learn from rejected extractions to improve accuracy
- **Agent composition**: Combine agents to produce richer output (e.g., requirement + test cases in one pass)
- **Real-time meeting co-pilot**: Live transcript display + instant extraction suggestions during call
