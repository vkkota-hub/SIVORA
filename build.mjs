import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'dist');
const siteUrl = (process.env.SITE_URL || 'https://sivora.org').replace(/\/$/, '');
const socialImage = `${siteUrl}/assets/sivora-hero-poster.jpg`;
const logoImage = `${siteUrl}/images/sivora-brand-transparent.png`;
const source = await readFile(path.join(root, 'index.html'), 'utf8');
// Reuse the site's content functions at build time so every page has full HTML.
const views = vm.createContext({location:{pathname:'/',hash:''},window:{addEventListener(){}}});
const clientScript = source.match(/<script>([\s\S]*?)<\/script>/)[1];
vm.runInContext(clientScript.slice(0, clientScript.lastIndexOf("  document.addEventListener('click'")), views);
const routeViews = {'/':'home()', '/about-us':'aboutPage()', '/leadership':'leadershipPage()', '/services':'servicesPage()', '/insights':'blogPage()', '/blog':'blogPage()', '/contact':'contact()', '/professionals':'professionalsPage()', '/careers':'careers()', '/sitemap':'sitemapPage()'};
function pageContent(page){
  const expression = routeViews[page.path] || (['/privacy','/cookies','/terms','/recruitment-scam-alert'].includes(page.path) ? `policyPage(${JSON.stringify(page.path.slice(1))})` : `serviceDetailPage(${JSON.stringify(page.path.slice(1))})`);
  let content = vm.runInContext(expression, views);
  if (page.path === '/leadership') content = content.replace('<section class="page-section leadership-approach">', '<section class="page-section leadership-profile"><div class="wrap"><div class="eyebrow">Founder &amp; CEO</div><div class="profile-grid"><div><h2>Prem Kumar Tammineni, MBA</h2><p class="profile-role">Founder &amp; CEO, SIVORA LIMITED</p></div><div class="profile-copy"><p>Prem Kumar Tammineni is the Founder and CEO of SIVORA LIMITED, bringing extensive international experience across talent acquisition, executive search, workforce planning, talent strategy and HR transformation.</p><p>Over his career, Prem has partnered with senior business, HR and functional leaders across technology, fintech, banking, SaaS and enterprise services, supporting organisations through growth, transformation and changing workforce requirements.</p><p>His career includes leadership and specialist roles with NCR Atleos, HSBC, Barclays, DXC Technology, FIS, NTT DATA, Monitise, Oracle and Wipro. Working across international markets, he has supported complex organisations with executive and leadership hiring, workforce strategy and transformation.</p></div></div></div></section><section class="page-section leadership-approach">');
  return content.replace(/<span>Registered office: 27 Whinham Green, Aylesbury, Buckinghamshire, HP18 0XJ<\/span>/g, '');
}


const pages = [
  { path: '/', file: 'index.html', title: 'SIVORA | Leadership. Talent. Technology.', description: 'Independent leadership, talent and technology advice from SIVORA LIMITED.', eyebrow: 'Leadership · Talent · Technology', heading: 'Make complex change clear.', copy: 'SIVORA LIMITED provides independent advice on leadership, talent, workforce capability and technology. Explore our services, learn about the team or contact us to discuss your organisation’s needs.', links: [['Explore our services', '/services'], ['Contact SIVORA', '/contact']] },
  { path: '/about-us', file: 'about-us.html', title: 'About SIVORA | Leadership, talent and technology', description: 'Learn how SIVORA connects leadership, workforce capability and technology to help organisations move forward.', eyebrow: 'SIVORA / Overview', heading: 'A connected view of change.', copy: 'SIVORA is an independent leadership, talent and technology advisory firm. We help organisations connect business priorities with the people, capability and technology needed to deliver them.', links: [['Meet the leadership team', '/leadership'], ['Explore our services', '/services']] },
  { path: '/leadership', file: 'leadership.html', title: 'Leadership | SIVORA', description: 'Meet SIVORA’s leadership team and learn about its experience across leadership, talent and technology.', eyebrow: 'SIVORA / Leadership', heading: 'Experienced perspective. Clear decisions.', copy: 'SIVORA brings leadership, talent and technology experience to complex organisational decisions. Speak with us about the challenge your team needs to solve.', links: [['About SIVORA', '/about-us'], ['Contact SIVORA', '/contact']] },
  { path: '/services', file: 'services.html', title: 'Services | SIVORA', description: 'Executive search, leadership advisory, workforce and talent strategy, and technology consulting from SIVORA.', eyebrow: 'SIVORA / Services', heading: 'Build the capability to move forward.', copy: 'SIVORA works across Executive Search, Leadership Advisory, Workforce & Talent Strategy, and Technology Consulting.', links: [['Executive Search', '/executive-search'], ['Leadership Advisory', '/leadership-advisory'], ['Workforce & Talent Strategy', '/workforce-strategy'], ['Technology Consulting', '/technology-consulting']] },
  { path: '/insights', file: 'insights.html', title: 'Research & Insights | SIVORA', description: 'Perspectives from SIVORA on leadership, workforce capability, talent and technology change.', eyebrow: 'SIVORA / Insights', heading: 'Ideas for decisions that matter.', copy: 'Read SIVORA perspectives on leadership, workforce strategy, executive search and technology change.', links: [['Explore services', '/services'], ['Contact SIVORA', '/contact']] },
  { path: '/blog', file: 'blog.html', title: 'Research & Insights | SIVORA', description: 'Perspectives from SIVORA on leadership, workforce capability, talent and technology change.', eyebrow: 'SIVORA / Insights', heading: 'Ideas for decisions that matter.', copy: 'Read SIVORA perspectives on leadership, workforce strategy, executive search and technology change.', links: [['Explore services', '/services'], ['Contact SIVORA', '/contact']] },
  { path: '/contact', file: 'contact.html', title: 'Contact SIVORA | Leadership, talent and technology', description: 'Contact SIVORA LIMITED about leadership, talent, workforce strategy and technology consulting.', eyebrow: 'SIVORA / Contact', heading: 'Start a conversation.', copy: 'Contact SIVORA about leadership, talent, workforce capability or technology. Use the website form to send an enquiry to Contact@Sivora.org.', links: [['Email Contact@Sivora.org', 'mailto:Contact@Sivora.org']] },
  { path: '/executive-search', file: 'executive-search.html', title: 'Executive Search | SIVORA', description: 'SIVORA executive search identifies and engages leaders for roles where the right appointment matters.', eyebrow: 'SIVORA / Services', heading: 'Executive Search', copy: 'Identify and engage leaders with the experience and judgement to make a meaningful difference to performance, transformation and growth.', links: [['All services', '/services'], ['Contact SIVORA', '/contact']] },
  { path: '/leadership-advisory', file: 'leadership-advisory.html', title: 'Leadership Advisory | SIVORA', description: 'Practical leadership advisory for career progression, executive transitions and leadership development.', eyebrow: 'SIVORA / Services', heading: 'Leadership Advisory', copy: 'Support leaders and organisations through career progression, executive transitions, leadership development and change.', links: [['All services', '/services'], ['Contact SIVORA', '/contact']] },
  { path: '/workforce-strategy', file: 'workforce-strategy.html', title: 'Workforce & Talent Strategy | SIVORA', description: 'Connect business priorities to future workforce demand, skills, talent and organisational capability.', eyebrow: 'SIVORA / Services', heading: 'Workforce & Talent Strategy', copy: 'Understand future demand, assess capability and shape workforce choices that support organisational priorities.', links: [['All services', '/services'], ['Contact SIVORA', '/contact']] },
  { path: '/technology-consulting', file: 'technology-consulting.html', title: 'Technology Consulting | SIVORA', description: 'Technology consulting that connects business challenges with transformation capability and specialist talent.', eyebrow: 'SIVORA / Services', heading: 'Technology Consulting', copy: 'Connect business challenges with technology expertise, transformation capability and specialist talent.', links: [['All services', '/services'], ['Contact SIVORA', '/contact']] },
  { path: '/professionals', file: 'professionals.html', title: 'For Leaders & Professionals | SIVORA', description: 'Career strategy, executive positioning, CV and LinkedIn advisory, interview preparation and leadership development.', eyebrow: 'SIVORA / Professionals', heading: 'Your experience has value.', copy: 'SIVORA offers practical, independent support for leadership opportunities, career transitions and professional positioning.', links: [['Explore services', '/services'], ['Contact SIVORA', '/contact']] },
  { path: '/privacy', file: 'privacy.html', title: 'Privacy Policy | SIVORA', description: 'How SIVORA uses information submitted through the website or during recruitment.', eyebrow: 'SIVORA / Legal', heading: 'Privacy Policy', copy: 'SIVORA LIMITED explains what personal information it may receive, why it is used, how long it is kept and how to contact the company about your rights.', links: [['Contact SIVORA', 'mailto:Contact@Sivora.org']] },
  { path: '/cookies', file: 'cookies.html', title: 'Cookie Policy | SIVORA', description: 'SIVORA does not currently use analytics or advertising cookies on this website.', eyebrow: 'SIVORA / Legal', heading: 'Cookie Policy', copy: 'This policy explains the website’s current use of cookies and what SIVORA will do if optional analytics or other tracking is added.', links: [['Privacy Policy', '/privacy']] },
  { path: '/terms', file: 'terms.html', title: 'Terms & Conditions | SIVORA', description: 'Terms for using the SIVORA website.', eyebrow: 'SIVORA / Legal', heading: 'Terms & Conditions', copy: 'These terms cover use of the SIVORA website and explain the general nature of its content.', links: [['Contact SIVORA', 'mailto:Contact@Sivora.org']] },
  { path: '/recruitment-scam-alert', file: 'recruitment-scam-alert.html', title: 'Recruitment Scam Alert | SIVORA', description: 'How to recognise and report fake recruitment messages using the SIVORA name.', eyebrow: 'SIVORA / Safety', heading: 'Recruitment Scam Alert', copy: 'Scammers may pretend to represent SIVORA or use our name in fake job offers. SIVORA never charges candidates to apply, interview or receive an offer. Check unexpected messages with us before sharing personal information.', links: [['Contact SIVORA', 'mailto:Contact@Sivora.org']] },
  { path: '/careers', file: 'careers.html', title: 'Careers | SIVORA', description: 'Explore careers and current opportunities with SIVORA.', eyebrow: 'SIVORA / Careers', heading: 'Bring clarity to change.', copy: 'SIVORA is building a team of thoughtful consultants and engineers. Check the careers page for current opportunities or contact us to introduce yourself.', links: [['Contact SIVORA', 'mailto:Contact@Sivora.org']] },
  { path: '/sitemap', file: 'sitemap.html', title: 'Sitemap | SIVORA', description: 'Browse SIVORA company information, services, insights and contact details.', eyebrow: 'SIVORA / Sitemap', heading: 'Explore SIVORA.', copy: 'Browse the pages on SIVORA’s website, including company information, services, insights and contact details.', links: [['Home', '/'], ['All services', '/services'], ['Contact', '/contact']] },
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function setMeta(html, attribute, name, value) {
  const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tag = new RegExp(`<meta\\s+(?=[^>]*\\b${attribute}="${safeName}")[^>]*>`);
  return html.replace(tag, match => match.replace(/content="[^"]*"/, `content="${escapeHtml(value)}"`));
}
function prerender(page) {
  const canonical = `${siteUrl}${page.path === '/' ? '/' : page.path}`;
  const links = page.links.map(([label, href]) => `<a class="button" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`).join(' ');
  const main = `<main id="main" tabindex="-1">${pageContent(page)}</main>`;
  let html = source.replace(/<main id="main"[^>]*>[\s\S]*?<\/main>/, main);
  html = html.replace('<body>', page.path === '/' ? '<body class="home-mode">' : '<body>');
  html = html.replace('<head>', '<head>\n  <base href="/">');
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = setMeta(html, 'name', 'description', page.description);
  html = setMeta(html, 'property', 'og:title', page.title);
  html = setMeta(html, 'property', 'og:description', page.description);
  html = setMeta(html, 'property', 'og:image', socialImage);
  html = setMeta(html, 'name', 'twitter:image', socialImage);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`);
  html = setMeta(html, 'property', 'og:url', canonical);
  html = setMeta(html, 'name', 'twitter:title', page.title);
  html = setMeta(html, 'name', 'twitter:description', page.description);
  html = setMeta(html, 'name', 'twitter:image', socialImage);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`);
  html = html.replace(/<span>Registered office: 27 Whinham Green, Aylesbury, Buckinghamshire, HP18 0XJ<\/span>/g, '');
  html = html.replaceAll('© 2026 SIVORA LIMITED', '© 2026 SIVORA.ORG LIMITED');
  return html;
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
await cp(path.join(root, 'images'), path.join(output, 'images'), { recursive: true });
for (const page of pages) await writeFile(path.join(output, page.file), prerender(page));
const sitemapPages = pages.filter(page => !['/blog', '/about'].includes(page.path));
const urls = sitemapPages.map(page => `  <url><loc>${escapeHtml(`${siteUrl}${page.path === '/' ? '/' : page.path}`)}</loc></url>`).join('\n');
await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
console.log(`Generated ${pages.length} static routes in dist using ${siteUrl}`);
