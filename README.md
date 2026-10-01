# SIVORA website preview

`standalone-preview.html` is a self-contained interactive prototype for the SIVORA website. Its visible pages are generated in the browser and use local storage only for the careers demonstration.

## Preview

Open `standalone-preview.html` through a local static web server so the `assets/` and `images/` paths load correctly. The navigation uses browser path routes such as `/services` and `/contact`; the hosting service must be configured to serve this HTML file for those routes.

## Confirmed company details

- Legal name: SIVORA LIMITED
- Company number: 17466438
- Registered in England and Wales
- Registered office: 27 Whinham Green, Aylesbury, England, HP18 0XJ
- Contact email: Contact@Sivora.org
- Phone: not displayed, as requested by the client

## Current limitations before launch

- The contact form validates the fields and opens an email draft. It does not send the enquiry to a server or guarantee email delivery. Configure and verify the `Contact@Sivora.org` mailbox and an approved form delivery endpoint.
- Legal pages are short website drafts. Confirm the lawful basis and retention period for enquiries and candidate applications before publishing as final.
- The X icon is shown without a link until the company page URL is provided.
- The LinkedIn link uses the company ID Prem shared; confirm that it is the public company page before launch.
- Page content is rendered client-side. Search engines can execute JavaScript, but server rendering or pre-rendering and host rewrites are needed for reliable crawlable page URLs.
- The website has not been published. Connect the chosen custom domain and hosting configuration before launch.
