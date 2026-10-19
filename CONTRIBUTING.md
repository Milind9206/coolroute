# Contributing to CoolRoute

Thanks for helping improve CoolRoute. Small, focused changes with clear descriptions are easiest to review.

## Before you start

- Open an issue first for a large feature or behavior change so the scope can be discussed.
- Check existing issues and pull requests for related work.
- Never include passwords, API credentials, session cookies, personal location history, or other private user data in an issue, screenshot, or commit.

## Local development

1. Follow the install and Supabase setup in [README.md](README.md).
2. Create a feature branch from `main`.
3. Make a focused change and keep UI text in the existing language/content system where practical.
4. Before opening a pull request, run:

   ```bash
   npm run lint
   npm run build
   ```

## Pull requests

Include:

- The user-visible problem and what changed.
- Relevant screenshots for visual changes, with personal information removed.
- The checks you ran and any checks you could not run.
- Notes about database or environment-variable changes.

Keep unrelated formatting and generated files out of the diff. Do not commit `.env.local`, build output, logs, or dependency directories.

## Data and estimates

Describe route exposure and shade values as estimates. Changes to the model should document their assumptions and avoid suggesting that the app measures actual street-level shade or personal medical risk.
