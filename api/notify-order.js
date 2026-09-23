// Vercel serverless function: sends a Telegram message when the database reports a new order.
// The database calls this (see supabase/notifications.sql). Visitors never call it.
//
// Vercel environment variables:
//   NOTIFY_SECRET       a long random string. Must match notify_secret in the database.
//   TELEGRAM_BOT_TOKEN  the token BotFather gave you for your bot.
//   TELEGRAM_CHAT_IDS   who to alert: your chat id. Separate several with commas.

const crypto = require('crypto');

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

const rm = (n) => 'RM ' + Number(n).toFixed(2);
const PAYMENT = {
  cod: 'Cash on delivery',
  transfer: 'Bank transfer / DuitNow (send them the payment details)'
};

function buildMessage(o) {
  const items = (Array.isArray(o.items) ? o.items : []).slice(0, 15).map(
    (i) => i.qty + ' x ' + i.product_name + (i.size === 'set' ? ' (set of 3)' : ' (bar)')
  );
  const low = (Array.isArray(o.low_stock) ? o.low_stock : []).slice(0, 10).map(
    (i) => i.name + (Number(i.left) <= 0 ? ' (sold out)' : ' (' + i.left + ' left)')
  );
  return [
    'NEW ORDER ' + o.order_no,
    o.customer_name + ', ' + o.phone,
    '',
    ...items,
    '',
    'Total ' + rm(o.total) + (Number(o.shipping) > 0 ? ' (incl. delivery ' + rm(o.shipping) + ')' : ' (free delivery)'),
    'Payment: ' + (PAYMENT[o.payment_method] || o.payment_method),
    'Deliver to: ' + o.address + ', ' + o.postcode + ' ' + o.state,
    o.email,
    ...(low.length ? ['', 'LOW STOCK: ' + low.join(', ')] : [])
  ].join('\n');
}

function chatIds() {
  return (process.env.TELEGRAM_CHAT_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// To switch to another messaging provider later, only this function needs to change.
async function sendMessage(chatId, text) {
  const resp = await fetch('https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text, disable_web_page_preview: true })
  });
  if (!resp.ok) {
    let detail = '';
    try { detail = (await resp.json()).description || ''; } catch (e) {}
    throw new Error('Telegram responded with ' + resp.status + (detail ? ': ' + detail : ''));
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const secret = process.env.NOTIFY_SECRET;
  if (!secret || !safeEqual(req.headers['x-webhook-secret'], secret)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let order = req.body;
  if (typeof order === 'string') {
    try { order = JSON.parse(order); } catch (e) { order = null; }
  }
  if (!order || !order.order_no) return res.status(400).json({ error: 'Bad payload' });

  const ids = chatIds();
  if (!process.env.TELEGRAM_BOT_TOKEN || !ids.length) {
    console.error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_IDS is not set');
    return res.status(500).json({ error: 'Not configured' });
  }

  const text = buildMessage(order);
  const results = await Promise.allSettled(ids.map((id) => sendMessage(id, text)));
  const failed = results.filter((r) => r.status === 'rejected');
  failed.forEach((f) => console.error(String(f.reason)));

  if (failed.length === ids.length) return res.status(502).json({ error: 'Could not send' });
  return res.status(200).json({ ok: true, sent: ids.length - failed.length });
};