import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';

const recipient = 'Contact@Sivora.org';
const topics = new Set([
  'Executive Search',
  'Leadership Advisory',
  'Workforce & Talent Strategy',
  'Technology Consulting',
  'Career Advisory',
  'Other enquiry',
]);
const recentSubmissions = new Map();

function reply(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(status).json(body);
}

function validOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === String(host).toLowerCase();
  } catch {
    return false;
  }
}

function challengeSecret() {
  const secret = process.env.CONTACT_CHALLENGE_SECRET;
  return typeof secret === 'string' && secret.length >= 32 ? secret : null;
}

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function issueChallenge(secret) {
  const a = 2 + randomBytes(1)[0] % 8;
  const b = 2 + randomBytes(1)[0] % 8;
  const payload = Buffer.from(JSON.stringify({ a, b, issued: Date.now(), expires: Date.now() + 10 * 60_000, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  return { question: `What is ${a} + ${b}?`, token: `${payload}.${sign(payload, secret)}` };
}

function verifyChallenge(token, answer, secret) {
  if (typeof token !== 'string' || token.length > 1024 || typeof answer !== 'string') return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;
  const expected = Buffer.from(sign(payload, secret));
  const supplied = Buffer.from(signature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const now = Date.now();
    return Number.isInteger(data.a) && Number.isInteger(data.b)
      && Number(answer) === data.a + data.b
      && now >= data.issued + 2_000 && now <= data.expires;
  } catch {
    return false;
  }
}

function clean(value, maxLength) {
  if (typeof value !== 'string') return null;
  const result = value.trim();
  if (!result || result.length > maxLength || /\0/.test(result)) return null;
  return result;
}

function allowSubmission(ip) {
  const now = Date.now();
  const windowMs = 10 * 60_000;
  const recent = (recentSubmissions.get(ip) || []).filter(time => now - time < windowMs);
  if (recent.length >= 5) return false;
  recent.push(now);
  recentSubmissions.set(ip, recent);
  if (recentSubmissions.size > 1000) {
    for (const [key, values] of recentSubmissions) {
      if (!values.some(time => now - time < windowMs)) recentSubmissions.delete(key);
    }
  }
  return true;
}

export default async function handler(req, res) {
  // Same-origin GET requests normally have no Origin header. The signed
  // challenge is public; submissions still require a matching origin.
  const publicChallenge = req.method === 'GET' && req.query?.mode === 'challenge' && !req.headers.origin;
  if (!publicChallenge && !validOrigin(req)) return reply(res, 403, { error: 'Request could not be accepted.' });

  const secret = challengeSecret();
  if (!secret) return reply(res, 503, { error: 'The contact form is not configured yet.' });

  if (req.method === 'GET' && req.query?.mode === 'challenge') {
    return reply(res, 200, issueChallenge(secret));
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return reply(res, 405, { error: 'Method not allowed.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (typeof body.website === 'string' && body.website.trim()) return reply(res, 400, { error: 'Request could not be accepted.' });
  if (!verifyChallenge(body.challenge, String(body.captcha ?? ''), secret)) {
    return reply(res, 400, { error: 'Please complete the anti-spam check again.' });
  }

  const name = clean(body.name, 100);
  const email = clean(body.email, 160);
  const organisation = typeof body.organisation === 'string' ? body.organisation.replace(/[\r\n\0]/g, ' ').trim().slice(0, 140) : '';
  const topic = typeof body.topic === 'string' ? body.topic : '';
  const message = clean(body.message, 3000);
  if (!name || !email || /[\r\n]/.test(name) || /[\r\n]/.test(email) || !message || !topics.has(topic) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply(res, 400, { error: 'Please check the form details and try again.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (!allowSubmission(ip)) return reply(res, 429, { error: 'Please wait a few minutes before sending another enquiry.' });

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE !== 'false' : smtpPort === 465;
  const sender = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  if (!smtpHost || ![465, 587].includes(smtpPort) || !sender || !smtpPassword) {
    return reply(res, 503, { error: 'The contact form is not configured yet.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      requireTLS: !smtpSecure,
      auth: { user: sender, pass: smtpPassword },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
    await transporter.sendMail({
      from: { name: 'SIVORA Website', address: sender },
      to: recipient,
      replyTo: { name, address: email },
      subject: `SIVORA website enquiry — ${topic}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Organisation: ${organisation || 'Not provided'}`,
        `Topic: ${topic}`,
        '',
        message,
      ].join('\n'),
    });
    return reply(res, 200, { sent: true });
  } catch (error) {
    console.error('SIVORA contact email delivery failed:', error?.code || error?.name || 'unknown error');
    return reply(res, 502, { error: 'We could not send your enquiry just now. Please email Contact@Sivora.org.' });
  }
}
