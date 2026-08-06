# AI Learning Assistant & Intelligent Automation

Task 014 delivers a secure, role-aware AI assistant for AviatorPass. Responses are **grounded** in platform data (enrollments, progress, classes, analytics). The provider layer is deterministic/mock today and designed for future LLM upgrades.

## Architecture

| Service                            | Path                                    |
| ---------------------------------- | --------------------------------------- |
| Access / safety / rate limits      | `services/ai/access.ts`                 |
| Context builder                    | `services/ai/context-service.ts`        |
| Provider (intent + reply + stream) | `services/ai/provider.ts`               |
| Conversations                      | `services/ai/conversation-service.ts`   |
| Recommendations                    | `services/ai/recommendation-service.ts` |
| Summarization                      | `services/ai/summarization-service.ts`  |
| Question generation                | `services/ai/question-service.ts`       |
| Study planner                      | `services/ai/study-planner-service.ts`  |
| Writing                            | `services/ai/writing-service.ts`        |
| NL search                          | `services/ai/search-service.ts`         |
| Insights                           | `services/ai/insights-service.ts`       |
| Prompts                            | `services/ai/prompt-service.ts`         |

Store: `.data/aep-ai.json` · SQL twin: `database/migrations/013_ai_assistant.sql`

## Personas

- **Student** — explain, summarize, tips, recommendations, practice questions, study plans, exam prep
- **Instructor** — objectives, quizzes, announcements, emails, writing, study guides
- **Admin / Super Admin** — insights, executive summaries, campaigns, AI logs/usage

## APIs

| Method   | Path                      | Notes                                                          |
| -------- | ------------------------- | -------------------------------------------------------------- |
| GET/POST | `/api/ai/chat`            | Bootstrap, conversations, stream SSE (`stream:true`), feedback |
| GET      | `/api/ai/recommendations` | Student course recommendations                                 |
| POST     | `/api/ai/summarize`       | Lessons/modules/courses/notes/text                             |
| POST     | `/api/ai/questions`       | MCQ / T-F / essay / flashcards                                 |
| GET/POST | `/api/ai/planner`         | Generate / edit / accept study plans                           |
| POST     | `/api/ai/write`           | Instructor/admin writing drafts                                |
| GET      | `/api/ai/search?q=`       | Natural language search                                        |
| GET      | `/api/ai/insights`        | Insights; `view=logs\|usage` for admins                        |

## UI

- Floating assistant on all role dashboards (`RoleShell`)
- Hub pages: `/student/ai`, `/instructor/ai`, `/admin/ai`, `/super-admin/ai`

## Safety

- Role + `ai.*` permissions
- Unsafe prompt filter + rate limit (30/min)
- Never invents enrollments; redacts emails/cards in logs
- All interactions logged (`ai_logs` + activity actions)

## Feature flag

`features.ai` (default `true`) in platform settings.

## Demo

OTP `123456` — open any dashboard and use the sparkles FAB, or visit **AI Assistant** in the nav.
