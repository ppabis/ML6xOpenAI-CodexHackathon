# Stack Presets

## Web App / Dashboard

- When to use it: you need interactive UI plus a visible demo
- Suggested technologies: React, Vite, simple component library, lightweight API or mock data
- Why it fits: fast to demo, easy to show value, flexible for many ideas
- Risks or setup concerns: UI polish can eat time; avoid complex auth
- Suggested Codex prompt:

```text
Generate a minimal web dashboard starter for this hackathon idea using a lightweight modern stack. Keep the structure small, setup easy, and the first demo path obvious.
```

## Full-Stack App

- When to use it: you need both UI and real backend behavior
- Suggested technologies: Next.js or React + small API, SQLite or in-memory storage
- Why it fits: covers end-to-end flows without too much infrastructure
- Risks or setup concerns: avoid background jobs and multi-service sprawl
- Suggested Codex prompt:

```text
Generate a minimal full-stack starter with one clear end-to-end flow, simple storage, and easy local setup.
```

## Data App / BI Dashboard

- When to use it: the value is insight, metrics, or summarization
- Suggested technologies: Python, Streamlit or notebook, pandas, CSV/mock data
- Why it fits: very fast path to demoable outputs
- Risks or setup concerns: avoid overbuilding ETL and data pipelines
- Suggested Codex prompt:

```text
Create a small data app starter focused on loading sample data, computing useful metrics, and presenting the result in a demo-friendly UI.
```

## CLI Tool

- When to use it: the value is automation, workflows, or developer productivity
- Suggested technologies: Python or Node.js CLI, simple config, local files
- Why it fits: low setup, fast iteration, easy to keep local-first
- Risks or setup concerns: less visually impressive unless paired with clear output
- Suggested Codex prompt:

```text
Generate a minimal CLI tool starter for this workflow idea with clean commands, helpful output, and testable structure.
```

## Agent Workflow

- When to use it: the core value is orchestration, delegation, or multi-step reasoning
- Suggested technologies: Python or TypeScript, small workflow engine, local mocks, optional LLM API
- Why it fits: strong match for AI-native themes
- Risks or setup concerns: agent sprawl and vague success criteria
- Suggested Codex prompt:

```text
Create a minimal agent workflow prototype with clear stages, explicit handoffs, and observable outputs. Prefer local mocks unless external services are necessary.
```

## Evaluation Framework

- When to use it: the challenge is comparing outputs, prompts, models, or policies
- Suggested technologies: Python, notebooks or scripts, CSV/JSON datasets, simple scoring
- Why it fits: measurable and review-friendly
- Risks or setup concerns: keep evaluation dimensions narrow
- Suggested Codex prompt:

```text
Generate a small evaluation framework starter with sample data, explicit metrics, and a reproducible local run flow.
```

## Developer Tooling

- When to use it: the product helps engineers work faster or safer
- Suggested technologies: CLI, VS Code extension prototype, git-based tooling, lightweight web UI if needed
- Why it fits: great fit for technical participants and demo audiences
- Risks or setup concerns: integrations can be fragile; mock external systems early
- Suggested Codex prompt:

```text
Create a minimal developer-tool prototype around this workflow with one polished core scenario and light dependencies.
```

## Computer Vision / Multimodal Prototype

- When to use it: the idea depends on images, OCR, or multimodal reasoning
- Suggested technologies: Python, notebook or small app, image samples, optional hosted model API
- Why it fits: strong visual demos and clear AI value
- Risks or setup concerns: model/API reliability and large sample handling
- Suggested Codex prompt:

```text
Generate a compact multimodal prototype that works on a few prepared sample inputs and surfaces the output clearly. Optimize for reliability over scale.
```

## Event Streaming Prototype

- When to use it: the product reacts to a stream of messages or events
- Suggested technologies: small consumer service, mocked broker or local event file replay, simple dashboard/log output
- Why it fits: good for operational or analytics ideas
- Risks or setup concerns: live infra setup can consume the day
- Suggested Codex prompt:

```text
Create a minimal event-driven prototype with a local or mocked event source, one processing path, and a clear output view.
```

## Local LLM / Ollama Prototype

- When to use it: privacy, offline behavior, or local-first AI matters
- Suggested technologies: Ollama, Python or Node.js wrapper, local UI or CLI
- Why it fits: strong local-first story and fewer external dependencies
- Risks or setup concerns: model download/setup time and machine constraints
- Suggested Codex prompt:

```text
Generate a minimal local-LLM prototype designed for Ollama with graceful fallback behavior and a small demo surface.
```

## 2D Browser Game Or Interactive Demo

- When to use it: the idea benefits from playful interaction or narrative
- Suggested technologies: Phaser, Vite, lightweight assets, local state
- Why it fits: memorable demos and clear engagement
- Risks or setup concerns: art and gameplay scope can explode quickly
- Suggested Codex prompt:

```text
Create a tiny 2D browser demo with one core mechanic, fast local setup, and simple placeholder assets so the team can focus on the main concept.
```
