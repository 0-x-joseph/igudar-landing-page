# Contributing to IGUDAR

> Same file in both repos (`igudar` and `igudar-landing-page`).
> These rules apply to everyone, and they are **mandatory** for Claude Code and any other AI agent.

## 1. Branches

| Branch | Who may push | Notes |
|---|---|---|
| `master` (and `main` if it ever exists) | **Humans only, through a reviewed PR** | The default branch. Never pushed to by an agent, ever. |
| Existing branches (`feat/igudar-fintech-ui`, `feat/property-investment-tools`, `chore/latest-deps`, `ilyas`, …) | Their human owner | Agents never commit to, push to, rebase, or delete them. |
| `claude/*` | Claude Code | One **brand-new** branch per task, created from the latest `origin/master`. |

### Every Claude Code task starts like this

```bash
git status                                   # 1. working tree must be clean
git diff --ignore-cr-at-eol --stat           #    (Windows: CRLF-only noise is not a real change)
git fetch origin                             # 2. get the latest master
git ls-remote --heads origin claude/<name>   # 3. must print nothing: the branch must not exist yet
git switch -c claude/<yyyymmdd>-<area>-<short> origin/master   # 4. brand-new branch
```

- Name: `claude/<yyyymmdd>-<area>-<short-description>`, lowercase, hyphens. Examples: `claude/20261010-finance-engine`, `claude/20261011-kyc-onboarding`, `claude/20261012-landing-simulator`.
- If the working tree has real uncommitted changes (not just line endings), **stop and ask** — they may be the co-founder's work. Never stash, reset, clean, or discard them.
- Never reuse an old branch for a new task. Follow-up fixes on the *same* task go on the same `claude/*` branch.
- Never commit on `master`, even locally.

### Pushing and pull requests

```bash
git push -u origin claude/<yyyymmdd>-<area>-<short>     # always name the branch explicitly
gh pr create --draft --base master --head claude/<...>   # or give the user the compare URL if gh isn't installed
```

- PRs are opened as **drafts** against `master`. A human (one of the two founders) reviews and merges. Agents **never** merge, approve, close or delete PRs or branches.
- Forbidden for agents: `--force` / `-f` / `+refspec` pushes, `--no-verify`, deleting branches (local or remote), `git reset --hard`, `git clean`, `git checkout -- .`, `git rebase` of anything already pushed, changing git config or hooks, pushing tags, `--all` / `--mirror`.
- Keep master's history linear and readable: humans merge with "Squash and merge" or "Create a merge commit" as they prefer; agents don't decide.

## 2. Commits

Follow the existing history: Conventional Commits with a scope.

```
feat(finance): add shared fee grid and return engine
fix(auth): route recovery emails to the reset page
docs: record cycle 11 verification
chore(deps): bump next to 16.3.8
```

- Small, focused commits; message says *why* when it isn't obvious.
- Never commit secrets (`.env*` is ignored — keep it that way), generated build output, or CRLF-only churn.

## 3. Before you push (Definition of done)

Platform: `npm run typecheck` · `npm run lint` (no new warnings) · `npm test` · `npm run build` · Playwright screenshots (390 / 768 / 1280 px, light and dark) · `PROGRESS.md` cycle entry.
Landing: `npm run lint` · `npm run build` · `lib/finance` tests · screenshots (390 / 768 / 1280 / 1600 px) · Lighthouse accessibility ≥ 95.

The PR description lists: what changed, screenshots, test results, and every **question-gate** item (business logic, amounts, fees, legal copy) that needs a founder decision.

## 4. Guards that enforce this (don't remove them)

1. **`.claude/settings.json`** — Claude Code permission rules: denies pushes to `master`/`main`, force-pushes, branch deletion, `--no-verify`, destructive resets and PR merges; asks before every other push.
2. **`.git/hooks/pre-push`** (local, installed per clone from `claude-code-brief/git-guard/pre-push`) — when the push comes from Claude Code, it rejects anything that isn't a `claude/*` branch, any branch deletion and any force-push. Pushes from your own terminal are not affected.
3. **GitHub branch protection on `master`** (repo owner sets it once): Settings → Branches (or Rules → Rulesets) → add a rule for `master` → require a pull request before merging, block force pushes, block deletions. This is the only guard that also protects against mistakes made outside your computer.
