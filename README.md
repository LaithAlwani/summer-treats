# 🍪🍹 Summer Treats

A colorful preorder website for a kids' summer baking & drinks stand, plus an
admin portal for the family to run it.

- **Public site** — this week's menu (changes day to day, multiple items per
  day), each item with a photo, ingredients, and clear allergy warnings.
- **Preorders** — customers build an order, then it's **saved to the portal**
  _and_ handed off to your **Instagram DMs** (the order is copied to their
  clipboard and `ig.me` opens so they paste & send).
- **Admin portal** (`/admin`) — live order board, manage items (with photo
  upload), assign items to each day, and a switch to **pause/resume preorders**.
- No online payment — pay at pickup.

Built with Next.js 16 (App Router) + Convex (database, realtime, file storage)
+ Convex Auth.

---

## Running locally

```bash
npm install
npm run dev:all
```

`npm run dev:all` starts **Convex** and **Next.js** together. Then open
http://localhost:3000.

> Prefer two terminals? Run `npm run convex` in one and `npm run dev` in the
> other.

### First time: create your admin account

1. Go to http://localhost:3000/admin/login
2. Click **"First time? Create the owner account"**, enter an email + password.
3. You're in. Add items on the **Items** page, then put them on days from the
   **Schedule** page. Toggle **Pause preorders** from the dashboard anytime.

> This is a single-owner portal: create the account once. Anyone who signs in is
> treated as the admin, so don't share the password.

---

## How orders reach your Instagram

Instagram doesn't allow a website to drop a message straight into your inbox
(their API only lets you _reply_ to people who message you first, and DM links
can't pre-fill text). So the flow is:

1. Customer places the order → it's **saved in your admin portal** immediately.
2. On the confirmation screen they tap **"Copy & open Instagram DMs"** — the
   order text is copied and your DMs open (`ig.me`, mobile app).
3. They paste & send; you reply to confirm.

Because every order is saved regardless, **you never lose an order** even if the
customer forgets to send the DM — you can follow up using the Instagram handle
they entered.

Your handle is set via `NEXT_PUBLIC_IG_USERNAME` in `.env.local`
(currently `summertreatskids`).

---

## Environment variables (`.env.local`)

| Variable                      | Set by            | Purpose                          |
| ----------------------------- | ----------------- | -------------------------------- |
| `CONVEX_DEPLOYMENT`           | `convex dev`      | Which Convex deployment to use   |
| `NEXT_PUBLIC_CONVEX_URL`      | `convex dev`      | Convex client URL                |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `convex dev`      | Convex HTTP actions URL          |
| `NEXT_PUBLIC_IG_USERNAME`     | you               | Instagram handle for DM links    |

Auth secrets (`JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL`) live **on the Convex
deployment**, not in `.env.local`.

---

## Going live (Vercel + Convex cloud)

The local setup uses a free, login-free **local** Convex deployment. To put the
site on the internet:

1. **Create a cloud Convex deployment:** `npx convex login` then
   `npx convex dev --configure` and pick a **cloud** dev deployment (or run
   `npx convex deploy` for production).
2. **Set the auth keys on the cloud deployment:**
   `npx @convex-dev/auth` (follow the prompts). This sets `JWT_PRIVATE_KEY`,
   `JWKS`, and `SITE_URL`. Set `SITE_URL` to your real site URL.
3. **Deploy the frontend to Vercel.** Add the env vars above in Vercel’s
   project settings (`NEXT_PUBLIC_CONVEX_URL` from the cloud deployment, and
   `NEXT_PUBLIC_IG_USERNAME`). Set the Vercel build command to
   `npx convex deploy --cmd 'npm run build'` so Convex functions deploy with the
   site.
4. Create your admin account on the live `/admin/login` once.

> On Windows, the `npx @convex-dev/auth` helper can crash _after_ setting a
> variable due to a Node/libuv bug. If that happens, the variables that printed
> "Successfully set" are fine; `scripts/setup-auth-keys.mjs` shows how to set the
> JWT keys directly if you need to.

---

## Useful commands

| Command            | What it does                          |
| ------------------ | ------------------------------------- |
| `npm run dev:all`  | Convex + Next.js together (local dev) |
| `npm run build`    | Production build                      |
| `npm run lint`     | ESLint (Next 16 doesn't lint on build)|
| `npm run typecheck`| `tsc --noEmit`                        |

## Project layout

- `convex/` — schema + functions (`items`, `schedule`, `orders`, `settings`,
  `auth`).
- `app/(public)/` — customer site (menu, item detail, order, confirmation).
- `app/admin/` — portal (login + dashboard/items/schedule).
- `components/`, `lib/` — UI pieces and helpers (cart, allergens, formatting).
