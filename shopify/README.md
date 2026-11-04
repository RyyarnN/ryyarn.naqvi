# The 100% Chain on the Crescent Jewelers Shopify store

One Shopify page with everything from the standalone site: hero with countdown, how it works,
the prize, the signup form, the live leaderboard, the official rules and the 18+ age gate.
Signups and the leaderboard still run on the Netlify backend (`the-100-percent-chain.netlify.app`).

Files:

| File | Goes in theme folder |
| --- | --- |
| `sections/hundred-chain.liquid` | Sections |
| `templates/page.hundred-chain.json` | Templates |
| `assets/hundred-chain.css` | Assets |
| `assets/hundred-chain.js` | Assets |
| `assets/hundred-chain-hero-1200.jpg` | Assets |
| `assets/hundred-chain-hero-2400.jpg` | Assets |
| `rules-page-content.html` | Not a theme file: pasted into the page's content |

## Install

1. **Duplicate the live theme first.** Online Store → Themes → `…` on the current theme → Duplicate.
   Do everything below on the copy, so customers see nothing until you publish.
2. On the copy: `…` → **Edit code**.
3. **Sections** → Add a new section → name it `hundred-chain` → replace everything with
   `sections/hundred-chain.liquid` → Save.
4. **Templates** → Add a new template → type **page**, name `hundred-chain` (choose JSON) →
   replace everything with `templates/page.hundred-chain.json` → Save.
5. **Assets** → Add a new asset → create `hundred-chain.css` and `hundred-chain.js` with the file
   contents, then **upload** the two `hundred-chain-hero-*.jpg` images (names must match exactly).
6. **Online Store → Pages → Add page.** Title: `The 100% Chain`. In the content box click
   **Show HTML** (`<>`) and paste `rules-page-content.html`. On the right, set **Theme template** to
   `hundred-chain`. Save. The page lives at `/pages/the-100-chain`.
7. **Customize** the duplicated theme → open that page → click the **100% Chain challenge** section to set:
   - **Pendant image**: upload the render. The prize section only shows once an image is set.
   - **Button link**: your Pendants collection.
   - The intro text and launch time, if they ever change.
8. Preview the duplicated theme, check the page, then **Publish** it.
9. Add the page to your menu: Online Store → Navigation → Main menu → Add menu item.

## Notes

- The rules are the page's own content, so you edit them in **Pages**, not in code. Fill in every
  `[BRACKETED]` placeholder, have a lawyer review them, then delete the DRAFT paragraph at the top.
- The age gate shows on this page only, once per browser. It's hidden in the theme editor so it
  doesn't get in the way while you customize.
- Everything is scoped to this one section, so it doesn't change any other page of the store.
