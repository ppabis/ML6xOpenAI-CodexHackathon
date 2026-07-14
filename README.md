# Codex Hackathon Starter

## Theme

**AI-Native Way of Working: Using Codex as a Partner at Every Step**

This starter helps a team go from a rough idea to a credible demo within one hackathon day. It is designed for technical teams who want to use Codex across the full delivery lifecycle, not just for code generation.

## Why This Repo Exists

This repository gives teams the "how":

- a simple workflow
- clear planning artifacts
- role guidance
- prompt starters
- quality checkpoints
- demo preparation structure

Teams bring the "what": the product, tool, workflow, or prototype they want to build.

## Why Markdown-First And Tech-Agnostic

- It works before you choose a stack.
- It keeps the team aligned while scope is still moving.
- It supports fast collaboration between humans and Codex.
- It avoids wasting time on boilerplate too early.
- It works for web apps, agents, dashboards, developer tools, data products, and experiments.

## How To Use This Repo

1. Start with [00-product-brief.md](./00-product-brief.md).
2. Assign roles in [01-team-roles.md](./01-team-roles.md).
3. Break the work down in [02-task-breakdown.md](./02-task-breakdown.md).
4. Decide the stack and architecture in [03-architecture.md](./03-architecture.md).
5. Plan implementation in [04-implementation-plan.md](./04-implementation-plan.md).
6. Define validation in [05-test-plan.md](./05-test-plan.md).
7. Use Codex to help generate and review implementation work.
8. Capture the outcome in [06-pr-summary.md](./06-pr-summary.md), [07-demo-script.md](./07-demo-script.md), and [08-codex-workflow-log.md](./08-codex-workflow-log.md).

## Recommended Workflow

- Pick an idea with a visible, demoable outcome.
- Narrow scope aggressively.
- Choose a stack only after the problem and constraints are clear.
- Split work into parallel streams for product, implementation, quality, and demo.
- Use Codex for planning, architecture, implementation, review, and documentation.
- Keep a running workflow log so you can explain how AI helped.

See [guides/ai-native-workflow.md](./guides/ai-native-workflow.md) and [guides/codex-usage-guide.md](./guides/codex-usage-guide.md).

## Expected Outputs

By the end of the day, teams should ideally have:

- a clear product brief and scope
- a role split and task plan
- an architecture decision
- a working prototype or a credible partial implementation
- tests or validation evidence
- setup notes and limitations
- a PR-style summary
- a short demo script
- a Codex workflow log

## How To Use Codex Across The Lifecycle

- Scope the idea and challenge over-ambition.
- Turn goals into parallel tasks with acceptance criteria.
- Compare stack options and suggest a right-sized architecture.
- Generate implementation plans before generating code.
- Produce code, tests, docs, and review notes when the plan is clear.
- Help summarize progress and prepare the demo narrative.

## How To Choose A Stack

Use the simplest stack that makes the demo believable.

- If the value is visual and interactive, prefer a small web stack.
- If the value is automation, prefer a CLI or agent workflow.
- If the value is analysis, prefer a notebook, script, or dashboard.
- If setup risk is high, choose fewer services and fewer moving parts.

Start with [guides/stack-presets.md](./guides/stack-presets.md).

## How To Use The Example Ideas

- Use [examples/example-ideas.md](./examples/example-ideas.md) if your team needs inspiration.
- Use [examples/submitted-ideas-scoping.md](./examples/submitted-ideas-scoping.md) to pressure-test ideas against one-day reality.
- Borrow scope cuts, stack choices, and prompt starters directly.

## Definition Of Done

The team is done when the scope is clear, the implementation is credible, the demo is rehearsable, and the role of Codex is visible and explainable.

Use [guides/definition-of-done.md](./guides/definition-of-done.md) as the final checklist.

## Final Reminder

The final implementation can use any stack. This starter only gives structure so teams can move quickly, stay realistic, and show an AI-native way of working.
