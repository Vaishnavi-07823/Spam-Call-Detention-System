# VoxShield AI — Real-Time Spam/Scam Call Detection
 
Final year project (B.Tech CSE - Cybersecurity) that listens to an ongoing call in real time and tells you how likely it is to be a scam, while it's still happening — not after you've already lost money.

## Why I built this

Most fraud call detection tools work after the fact — they analyze recordings or complaints once the damage is done. Phone/UPI scams in India move fast, and by the time someone realizes something is off, the transfer is already made. The idea here was to catch red flags **live**, mid-call, so the person gets a warning while they can still hang up.

## How it works

- The app listens to the call audio through the mic (works when the call is on speaker) and transcribes it live using the Web Speech API
- Every few seconds, the latest chunk of the conversation is sent to an AI model (Gemini) which scores it for scam risk based on patterns like urgency, OTP/PIN requests, fake authority claims, payment pressure, etc.
- The risk score updates live on screen as a gauge
- If the score crosses a threshold, a warning banner shows up immediately — without the mic stopping or the app changing screens, so monitoring doesn't break mid-call
- Once the call ends, it shows a summary based on the highest risk detected during the whole call, and logs it to history

## Tech stack

- **Frontend:** React (TanStack Start + TanStack Router), Tailwind CSS, Framer Motion for animations, shadcn/ui + Radix components
- **Speech:** Web Speech API for live transcription
- **AI:** Gemini API for transcript risk analysis
- **Backend/DB:** Supabase (auth + storing detection history)
- **Deployment:** Cloudflare (Vite plugin + Wrangler)

## Screens

- **Monitoring** — live call screen with waveform, live risk gauge, and inline alerts
- **Alert / Safe** — post-call summary based on peak risk detected
- **History** — past calls and their risk scores
- **Upload** — analyze a recorded call/audio file instead of live
- **Learn** — awareness content on common scam patterns
- **Settings**

## Running it locally

```bash
npm install
npm run dev
```

You'll need your own Supabase project and Gemini API key — add them to a `.env` file (not committed, see `.gitignore`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```

## What's still rough / future scope

- Right now it relies on mic capture (call has to be on speaker) — a proper telephony-level integration would be a much bigger next step
- Risk analysis is per-chunk, could be made smarter by tracking conversation context across the whole call instead of a sliding window
- No multilingual support yet (Hindi/Marathi mixed calls are common in real scam attempts here)

## About

Built by Vaishnavi Trivedi, B.Tech CSE (Cybersecurity), GHRCE Nagpur.
[GitHub](https://github.com/Vaishnavi-07823) · [LinkedIn](https://linkedin.com/in/vaishnavi-trivedi-cyber/)
