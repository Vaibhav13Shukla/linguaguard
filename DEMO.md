# LinguaGuard Demo Runbook

## 1. Prepare

- Set `LINGO_API_KEY` in the repository secrets.
- Publish this repository so `uses: yourusername/linguaguard@main` resolves.
- Create Supabase tables from the schema in the project brief.
- Set dashboard env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## 2. Trigger

- Open a PR in `test-repo` that touches `src/components/Hero.tsx` or `src/components/Pricing.tsx`.
- The action runs and posts/updates a PR comment.

## 3. Verify

- PR comment includes hardcoded strings, missing keys, stale checks, and coverage.
- If `auto-fix: true`, locale files are committed back to the PR branch.
- Dashboard receives webhook data and displays repo + scan history.

## 4. Record

- Show PR diff before/after action run.
- Show PR comment with issue summary.
- Show dashboard overview + recent scans.
