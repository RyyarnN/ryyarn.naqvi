# Handoff: install "The 100% Chain" page on the Crescent Jewelers Shopify store

## What this is

A giveaway page for Crescent Jewelers: the first player to reach 100% completion in GTA VI
(release Nov 19, 2026) on a live stream wins a custom pendant. The page has a hero with countdown,
how it works, a prize section, a signup form, a live leaderboard, official rules and an 18+
date-of-birth gate.

The code is **finished and tested**. Your job is only to **install it on a duplicate of the store's
theme** and create the page. Do not redesign or rewrite it.

- Store admin: `d5bprc-gq.myshopify.com` (admin is logged in, in Chrome)
- Code: GitHub repo `RyyarnN/ryyarn.naqvi`, branch `claude/festive-cray-r1f0ao`, folder `shopify/`
  (the user can also attach the files directly)
- Backend (already live, don't change): `https://the-100-percent-chain.netlify.app`.
  It serves `POST /api/signup` and `GET /api/leaderboard`, with CORS open to any origin.

## Files

| Repo file | Where it goes in the theme |
| --- | --- |
| `shopify/sections/hundred-chain.liquid` | Sections → `hundred-chain.liquid` |
| `shopify/templates/page.hundred-chain.json` | Templates → `page.hundred-chain.json` |
| `shopify/assets/hundred-chain.css` | Assets → `hundred-chain.css` |
| `shopify/assets/hundred-chain.js` | Assets → `hundred-chain.js` |
| `shopify/assets/hundred-chain-hero-1200.jpg` | Assets (upload, same name) |
| `shopify/assets/hundred-chain-hero-2400.jpg` | Assets (upload, same name) |
| `shopify/rules-page-content.html` | Not a theme file: the page's body content (step 5) |

File names must match exactly. The section loads the assets by these names.

## Steps

1. **Duplicate the live theme.** Online Store → Themes → `…` on the live theme → **Duplicate**.
   Rename the copy "Crescent – 100% Chain". **Never edit or publish the live theme.**
2. **Open the copy's code editor:** `…` → **Edit code**.
3. **Add the section:** Sections → **Add a new section** → name `hundred-chain` → replace all
   contents with `hundred-chain.liquid` → **Save**.
4. **Add the template:** Templates → **Add a new template** → type **page**, format **JSON**, name
   `hundred-chain` → replace all contents with `page.hundred-chain.json` → **Save**.
   (If the editor offers only Liquid, choose JSON. The theme must be Online Store 2.0.)
5. **Add the assets:** Assets → **Add a new asset** → create `hundred-chain.css` and
   `hundred-chain.js` and paste their contents. Then **upload** the two `.jpg` files.
6. **Create the page:** Online Store → **Pages** → **Add page**
   - Title: `The 100% Chain`
   - Content: click **Show HTML** (`<>`) and paste all of `rules-page-content.html`
   - Visibility: **Hidden** for now
   - Theme template (right side): `hundred-chain`. This option appears only in the theme where the
     template exists. If it isn't listed, check the template was saved in step 4.
   - Save. The URL should be `/pages/the-100-chain`.
7. **Customize the copy:** Themes → copy → **Customize** → top dropdown → Pages → `The 100% Chain`.
   Click the **100% Chain challenge** section:
   - **Button link** → the store's Pendants collection
   - **Pendant image** → only if the user provides the render (the prize section stays hidden without it)
   - Save.
8. **Verify on the copy's preview** (Themes → copy → `…` → Preview → go to `/pages/the-100-chain`):
   - The age popup appears. Enter an adult birth date and it closes.
   - The countdown is running.
   - The leaderboard shows "N players entered" (not "Couldn't load the leaderboard").
   - The Rules panel expands and shows the rules text.
   - It looks right on a phone-width window too.
   - Do **not** submit a test signup unless the user says so: it creates a real entry.
9. **Stop and report to the user** with the preview link. **Don't publish the theme** or make the
   page visible; the user decides when.

## Things to know

- Everything is scoped under the `.hc` CSS class, so it can't change other pages. If something
  looks off, it's probably a theme style leaking in. Fix it in `hundred-chain.css` only.
- The age popup is hidden inside the theme editor on purpose (`request.design_mode`). Test it in Preview.
- The rules still contain `[BRACKETED]` placeholders and a DRAFT note. Leave them. The user will fill
  them in after legal review, then delete the DRAFT paragraph in Pages.
- The page's text, launch time and images are editable section settings, so no code changes are
  needed for content updates.

## For the user, after install

1. Review the preview.
2. Fill in the rules placeholders and get legal review.
3. Upload the pendant image.
4. Publish the theme and set the page to **Visible**.
5. Add the page to the main menu: Online Store → Navigation.
