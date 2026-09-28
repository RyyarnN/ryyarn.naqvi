# The 100% Chain

Signup form and live leaderboard for a challenge: the first player to reach 100% completion in
Grand Theft Auto VI, live on stream, wins a custom gold and diamond pendant.

Not affiliated with Rockstar Games or Take-Two Interactive. Keep all branding free of GTA logos,
artwork and character likenesses.

## How it works

| Piece | File | What it does |
| --- | --- | --- |
| Landing page + form | `public/index.html` | Countdown to launch, how it works, entry form |
| Leaderboard | `public/leaderboard.html` | Public ranking by trophy/achievement %, refreshes every minute |
| Official rules | `public/rules.html` | **Draft.** Fill in the placeholders and have a lawyer review it |
| `POST /api/signup` | `netlify/functions/signup.js` | Validates and stores an entry, one per gamertag per platform |
| `GET /api/leaderboard` | `netlify/functions/leaderboard.js` | Public fields only (no names or emails) |
| Progress sync | `netlify/functions/sync-progress.js` | Scheduled every 10 min, pulls each entrant's progress |

Entries live in Netlify Blobs (store `entrants`). There's no database to set up.

The leaderboard shows who is closest. **It does not decide the winner.** The winner is verified
by hand from the 100% completion stat shown on stream.

## Setup

1. Deploy this repo to Netlify. The publish directory and functions are set in `netlify.toml`.
2. Add these environment variables in Netlify (Site configuration → Environment variables):

   | Variable | Where to get it |
   | --- | --- |
   | `OPENXBL_API_KEY` | Free account at https://xbl.io → API key |
   | `PSN_NPSSO` | Sign in to a **spare** PlayStation account at playstation.com, then visit `https://ca.account.sony.com/api/v1/ssocookie` and copy the `npsso` value. It expires about every 2 months. |
   | `GTA6_XBOX_TITLE_ID` | GTA VI's Xbox title ID, once the game is listed |
   | `GTA6_PSN_NP_COMM_ID` | GTA VI's trophy list ID (`NPWR…_00`), available at launch |

   Until the two game IDs are set, sync does nothing and the leaderboard shows "Awaiting launch."
   Signups still work.

## Local development

```sh
npm install
npm test          # validation and ranking tests
npx netlify dev   # runs the site and functions locally
```

## Caveats

- PSN and OpenXBL are unofficial or third-party APIs and can break or throttle without warning.
  When a sync fails, the entrant keeps their last known progress and the error is logged.
- Entrants whose trophies are private will fail to sync. The rules require public profiles.
- GTA VI's trophy list isn't public yet. Progress % is trophies/achievements earned, which may
  not match the in-game completion %.
