# Codex Usage Guide

## Give Codex Useful Context

Good inputs usually include:

- the product idea
- the target user
- time and team constraints
- any stack preferences or restrictions
- what "done today" means

## Ask For Scoping Help

Use prompts like:

```text
Reduce this idea to a one-day MVP for 3-4 technical participants. Separate must-haves from nice-to-haves and flag the riskiest parts.
```

## Ask For Task Breakdowns

```text
Turn this scoped idea into parallel workstreams with acceptance criteria, dependencies, and a suggested timebox plan.
```

## Ask For Architecture Proposals

```text
Recommend a simple stack and architecture for this idea. Optimize for low setup risk, fast iteration, and a believable demo.
```

## Use Codex For Implementation

- ask for file-by-file generation, not vague full systems
- start with the thinnest end-to-end path
- ask Codex to explain assumptions before large code generation
- keep humans reviewing integration points and dependency choices

Example:

```text
Generate the minimal project structure and the first working slice for this plan. Keep dependencies light and include short setup notes.
```

## Use Codex For Tests And Docs

- ask for a practical smoke test plan
- generate setup notes as you go
- use Codex to draft the PR summary while evidence is still fresh

## Review Codex Outputs Critically

Check for:

- scope creep
- unnecessary complexity
- missing failure handling
- vague setup instructions
- unverified claims

## Prompt Examples By Stage

- Scoping: "Challenge this idea and make it feasible in one day."
- Planning: "Split this into small parallel tasks for our team."
- Architecture: "Compare two stack options and recommend one."
- Build: "Generate the first thin slice and keep it reviewable."
- Quality: "Create the fastest validation plan that still gives confidence."
- Demo: "Turn this into a 3-minute story with clear evidence."
