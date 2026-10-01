# SIVORA architecture

## Public website
React + TypeScript + Vite deployed to Azure Static Web Apps.

## Careers content
The public site can initially use static seed data for local development. Production should use `/api/jobs` backed by Azure Table Storage (or another approved datastore).

## Admin authentication
Use Azure Static Web Apps authentication with Microsoft Entra ID. `/admin*` is restricted to the `admin` role in `staticwebapp.config.json`.

Do not implement a password directly in React. Anything in client JavaScript is visible to visitors.

## Admin careers API
- `GET /api/jobs` — public active jobs
- `GET /api/admin/jobs` — admin all jobs
- `POST /api/admin/jobs` — admin create
- `PUT /api/admin/jobs/{id}` — admin update
- `DELETE /api/admin/jobs/{id}` — admin delete

The included Azure Functions scaffold checks the Static Web Apps client principal for the `admin` role.

## Inquiry API
`POST /api/inquiry` stores inquiry data in Azure Table Storage in the included scaffold.

Before public launch add:
- server-side field limits and stronger validation
- anti-spam/rate limiting (e.g. CAPTCHA or edge rate policy as appropriate)
- notification workflow to a monitored mailbox/CRM
- retention/deletion policy for inquiry data
- privacy notice and consent wording reviewed for the applicable jurisdiction

## Map
The current footer intentionally uses a styled map placeholder because no real SIVORA office address was supplied. Replace it with a real map/embed after the business address is confirmed.
