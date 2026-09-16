# Security Policy

## Supported versions

Security fixes are applied to the current `main` branch.

## Reporting a vulnerability

Do not open a public issue for a potential security vulnerability, especially one involving health data, authentication, or API keys. Report it privately to the repository owner with:

- a clear description and impact;
- steps to reproduce or a proof of concept;
- affected files/endpoints; and
- any recommended mitigation.

Please do not include real patient or personal health information in reports. We will acknowledge valid reports promptly and work with you on a fix before public disclosure.

## Sensitive data

Keep `ASSEMBLY_AI_API_KEY` only in local or deployment environment variables. Never commit `.env`, `.env.local`, recordings, transcripts containing personal health information, or production SQLite data.
