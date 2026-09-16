<div align="center">

<img src="app/icon.svg" alt="MedSync AI" width="96" height="96" />

# MedSync AI

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-stone.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

</div>

MedSync AI is a voice-first health companion. It helps people describe symptoms, organize health notes, track medications, manage reminders, and view health patterns in a calm, grayscale clinical interface.

> **Medical disclaimer:** MedSync is not a substitute for professional medical advice, diagnosis, or treatment. In an emergency, call your local emergency number immediately.

## Features

- Voice conversation interface backed by AssemblyAI session/token wiring
- Symptom triage and emergency escalation tools
- Persistent health journal with search and severity filtering
- Medication tracking and interaction checks
- Medication and appointment reminders with on/off controls
- Health insights for symptoms, activity, mood, and severity
- Responsive grayscale clinical dashboard with accessible controls

## Quick start

**Requirements:** Node.js 20 LTS or newer and an AssemblyAI API key.

```powershell
git clone https://github.com/opeblow/medsyncai.git
cd medsyncai
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The browser tab uses the MedSync favicon automatically through Next.js metadata.

If PowerShell blocks `npm`, use the Windows command shim instead:

```powershell
npm.cmd install
npm.cmd run dev
```

## Environment variables

Create `.env.local`:

```env
ASSEMBLY_AI_API_KEY=your_assemblyai_api_key
```

Never commit this key. `.env.local` is intentionally ignored by Git.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development at port 3000 |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run the configured lint command |

## Architecture

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS
- **Voice:** AssemblyAI voice-agent integration and secure server-side token minting
- **Data:** SQLite via `better-sqlite3` for demo journal, medication, and reminder data
- **Medical tools:** Local symptom, medication, interaction, triage, and emergency endpoints

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). By contributing, you agree to follow the Code of Conduct.

## License

This project is licensed under the [MIT License](LICENSE).
