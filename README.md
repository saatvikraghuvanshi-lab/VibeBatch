# VibeBatch

VibeBatch is a social personality app where friends anonymously vote on each other's traits, build a public-facing vibe profile, and unlock premium visual identity cards.

Live site:

- https://vibebatch.net
- https://www.vibebatch.net

## Overview

VibeBatch turns friend feedback into a visual personality profile. Users can sign up, add friends, vote for one trait per friend, view trait percentages, create story cards, message friends, and access premium profile insights.

The app is built as a React/Vite frontend with Supabase handling authentication, profile data, friend relationships, messages, traits, and sponsored signals.

## Features

- Email/password authentication with Supabase
- Optional contact number during signup
- Profile photo upload and display name editing
- Friend system with relationship duration and voting eligibility
- Anonymous one-trait voting per friend
- Home dashboard with top traits, trait breakdown, friend activity, and story card download
- Traits tab with voted, custom, predefined, and sponsored trait sections
- Custom traits with creator attribution
- In-app messaging with text and voice messages
- Mute and block controls for friend chats
- Free story card download
- Premium tab with:
  - Anonymous trait hints
  - Shared top-trait clues
  - Premium personality card preview and download
  - Achievement card gallery
  - Vibe banner styling
  - Premium friend profile presentation
- Sponsored Signals section for company-backed traits
- Static About, Help, Terms, and Privacy pages
- Help chatbox with built-in VibeBatch support answers and email escalation

## Tech Stack

- React 19
- TypeScript
- Vite
- Supabase
- Tailwind CSS
- Motion / Framer Motion
- Lucide React icons
- Google Gemini integration for identity/personality text

## Project Structure

```text
VibeBatch/
  lib/
    supabase.ts        Supabase client
    types.ts           App types and predefined traits
    store.ts           Local store helpers
    gemini.ts          AI text helpers
  src/
    App.tsx            Main application UI and logic
    index.css          Global styling and theme
    main.tsx           React entry point
    assets/            Logos, premium backgrounds, banners
  index.html
  package.json
  vite.config.ts
```

## Local Development

Install dependencies:

```powershell
npm.cmd install
```

Run the development server:

```powershell
npm.cmd run dev
```

The app runs on:

```text
http://localhost:3000
```

## Build

Create a production build:

```powershell
npm.cmd run build
```

Preview the build:

```powershell
npm.cmd run preview
```

## Type Check

Run the TypeScript check:

```powershell
npm.cmd run lint
```

## Supabase Notes

The app uses Supabase for:

- Authentication
- Profiles
- Friendships
- Messages
- Traits
- Sponsored signals

The current Supabase client is configured in:

```text
lib/supabase.ts
```

For production auth redirects, Supabase should include:

```text
https://vibebatch.net
https://vibebatch.net/**
https://www.vibebatch.net/**
https://vibebatch.vercel.app/**
```

## Deployment

The app is deployed on Vercel.

Primary domain:

```text
https://vibebatch.net
```

The custom domain is managed through Hostinger DNS and points to Vercel.

Recommended DNS records:

```text
A      @     216.198.79.1
CNAME  www   c496f049930299c7.vercel-dns-017.com
```

Vercel also keeps the original deployment URL:

```text
https://vibebatch.vercel.app
```

## Important Product Rules

- Votes are anonymous.
- A user can vote for only one trait per friend.
- Sponsored Signals do not affect normal trait percentages.
- Custom trait names should be checked carefully before saving.
- Blocked users cannot message each other.
- Premium-only visual features are shown only to premium users.

## Support

For support, contact:

```text
vibebatchsocial@gmail.com
```

## License

Private project. All rights reserved.
