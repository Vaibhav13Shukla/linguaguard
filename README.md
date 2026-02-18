# LinguaGuard

Catches broken i18n before it ships. Powered by Lingo.dev.

Every PR reviewed. Every string checked. Every missing translation fixed automatically.

## The Problem

```tsx
<button>Subscribe Now</button>
```

Hardcoded UI text slips through review and ships untranslated.

## The Solution

LinguaGuard runs on every PR and catches:

- Hardcoded strings that should use `t()`
- Missing translations in locale files
- Stale translations when source text changes

Then it can auto-fix missing keys via Lingo.dev.

## What You Get

- GitHub Action scanner + PR report
- Optional auto-translation + commit to PR branch
- Dashboard for repo-level translation health over time
- Demo repo with intentional i18n issues

## Quick Start

```yaml
name: LinguaGuard
on:
  pull_request:
    branches: [main]

jobs:
  i18n-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: yourusername/linguaguard@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lingo-api-key: ${{ secrets.LINGO_API_KEY }}
          auto-fix: true
```

## Lingo.dev Integration

| Tool | Usage |
|------|-------|
| Lingo.dev API | Auto-translate missing keys |
| Lingo.dev CLI | Dashboard locale sync |
| Lingo.dev CI/CD | Translation workflow on locale source updates |

## Architecture

```text
PR opened
  -> GitHub Action runs
  -> AST scanner checks changed TSX/JSX
  -> Locale diff checks missing/stale keys
  -> (optional) Lingo.dev auto-fix + commit
  -> PR comment with findings and coverage
  -> Webhook sends scan results to dashboard
```

## Repo Structure

```text
linguaguard/
├── action/
├── dashboard/
├── test-repo/
├── .github/workflows/
├── README.md
└── DEMO.md
```

Built for the Lingo.dev Multilingual Hackathon.
