# SIVORA website — Azure setup

This folder contains the latest website, all 18 prerendered pages and the SMTP contact form backend.

## Local use

Use Node.js 22 or newer. Run `npm install`, copy `.env.example` to `.env`, then run `npm start`. Open http://localhost:4174. Set mailbox settings in `.env` to enable email delivery. Never commit passwords or `.env`.

## Azure hosting

Use **Azure App Service, Linux, Node.js 22 LTS**. The Node server serves the pages and `/api/contact`; a static-only upload cannot send email.

1. Commit this folder to GitHub. Generated `dist` and `node_modules` are ignored.
2. Connect the repository and branch in Azure App Service Deployment Center. Deployment must install dependencies using `npm ci`.
3. Set the startup command to `npm start`. This also builds the pages.
4. Add these App Service environment variables and restart:

| Setting | Value |
| --- | --- |
| `SITE_URL` | Actual Azure website URL; change to https://sivora.org after connecting the domain |
| `SMTP_HOST` | Your mailbox provider’s SMTP server |
| `SMTP_PORT` | 465 for implicit TLS, or 587 for STARTTLS |
| `SMTP_SECURE` | true for 465, false for 587 |
| `SMTP_USER` | Authorised sending mailbox |
| `SMTP_PASSWORD` | SMTP password or app password |
| `CONTACT_CHALLENGE_SECRET` | Random secret of at least 32 characters |

Azure supplies `PORT`. Generate the secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

For Gmail sending, use the Gmail address for `SMTP_USER`, `smtp.gmail.com` as host and a Google app password. SMTP sends mail; IMAP reads mail. Enquiries go to **Contact@Sivora.org** and replies go to the visitor’s email. The recipient mailbox must exist before launch.

Submit an enquiry after deployment and confirm its arrival. Real email delivery has not been verified with mailbox credentials.

## Included changes

- Updated footer: aligned branding, Explore links, contact beside the map, LinkedIn and X icon.
- Google Maps loads only when the visitor chooses to load it.
- Company registration and registered office details; public Admin link removed; no phone displayed.
- Terms & Conditions, Privacy Policy, Cookie Policy and Recruitment Scam Alert.
- Consistent service names, tagline and contact email; logo alt text and favicon.
- Real page URLs with full prerendered content, sitemap and sharing metadata.
- Form submits to the server instead of opening an email draft, with validation and spam checks.

Pending account details: X profile URL, domain connection and SMTP configuration. Confirm the policy text matches the firm’s actual data handling before launch.

Edit `index.html`; `standalone-preview.html` is a matching copy. `build.mjs` generates `dist`. `server.mjs` runs the Azure website and `api/contact.js` sends enquiries. Earlier Vercel configuration is retained, but Azure uses the Node server.
