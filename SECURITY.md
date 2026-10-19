# Security Policy

## Reporting a vulnerability

Please do not report security vulnerabilities in public issues. Use GitHub's **Report a vulnerability** option in the repository's Security tab so the report is private. Include the affected area, steps to reproduce, and potential impact. Do not include real user credentials or personal data in a report.

## Supported versions

Security fixes are made against the latest code on the `main` branch.

## Secret handling

Never commit real credentials, session cookies, private keys, or production data. If a secret is exposed, revoke or rotate it with its provider first; removing it from the latest commit does not erase it from Git history.
