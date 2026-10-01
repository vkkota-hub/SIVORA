# SIVORA website

This repository contains the SIVORA website and a small static-site build for Vercel.

## Build and preview

Run `node build.mjs` to generate the deployable site in `dist/`. Vercel uses the checked-in `vercel.json` build command, route rewrites and output directory. Set `SITE_URL` in Vercel when the company custom domain is connected; the current default is `https://sivora-livid.vercel.app`.

Open `standalone-preview.html` directly to view the interactive prototype. `index.html` is the production entry and is also the source used to generate the route-specific HTML pages and social metadata.

## Confirmed company details

- Legal name: SIVORA LIMITED
- Company number: 17466438
- Registered in England and Wales
- Registered office: 27 Whinham Green, Aylesbury, England, HP18 0XJ
- Contact email requested by the client: Contact@Sivora.org
- Phone number: not displayed, as requested

## Items still needing account setup or client confirmation

- The contact form opens an email draft. It does not send mail from the website. The Contact@Sivora.org mailbox and an approved delivery service must be set up before server-side form delivery can be enabled.
- Confirm SIVORA’s retention schedule and data-protection handling for enquiries and candidate applications before treating the privacy page as final.
- Add the X company-page URL after the client creates the account.
- Connect the sivora.org domain in Vercel and set `SITE_URL` to `https://sivora.org` after DNS is configured.
- The careers page has no sample vacancies. Its demo job editor is temporary and does not publish or save positions.
