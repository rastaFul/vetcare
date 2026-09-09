# SPEC — Harness Gates Rollout

## Goal
Install the Harness agent framework + Gate Hardening skill bundle into this repo, mirroring `agents-harness`. Deferred rollout from that initiative (QUESTIONS.md #18).

## Scope (closed)
IN scope:
- Copy: `CLAUDE.md`, `.claude/agents/*.md`, `skills/`, `steering/`, `templates/dev-quality/`, `.harness-sandbox/docker/` (real copy), `.github/workflows/gates.yml`, `.github/CODEOWNERS` (`@rastaFul`).
- Auto-install (root `package.json` exists): `snip`, `@playwright/mcp`, `claude-auto-retry`, `@lhci/cli`, `axe-playwright` devDependency, dev-quality bundle (husky/lint-staged/commitlint/dependency-cruiser/eslint-plugin-sonarjs/jscpd/Stryker) + husky hook activation — confirmed live: no pre-existing `.husky/`, dep-cruiser/jscpd/stryker/commitlint config here, purely additive.
- Register rollout in `.specs/project/STATE.md`/`DECISIONS.md`.

OUT of scope / repo-specific notes:
- Working tree was clean (no pending changes) at rollout time — no pre-existing WIP to avoid touching.
- Fixing real gate failures against existing app code, GitHub admin actions — same exclusions as every other repo in this batch.

## Done criteria
Same as the other rollout specs in this batch: install completes, files present, `bash -n`/`yamllint` PASS, real `npm install` succeeds, commit contains ONLY harness files, STATE.md/DECISIONS.md updated.

## Autonomous execution parameters
Same as the other rollout specs in this batch (single interactive pass, circuit breaker 3 retries then BLOCKED-and-continue-with-others).
