import * as cheerio from 'cheerio';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

let lastRequestTime = 0;
const MIN_INTERVAL = 3000;

async function rateLimitedFetch(url) {
  const now = Date.now();
  const wait = MIN_INTERVAL - (now - lastRequestTime);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestTime = Date.now();

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
    signal: AbortSignal.timeout(15000),
  });
  return response;
}

export async function searchWeb(keyword) {
  try {
    const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(keyword)}`;
    const response = await rateLimitedFetch(url);
    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $('tr').each((_, row) => {
      const link = $(row).find('a.result-link, td a').first();
      const title = link.text().trim();
      const href = link.attr('href');
      const snippet = $(row).find('td').last().text().trim();

      if (title && href && title.length > 5) {
        results.push({
          title,
          content: snippet || title,
          url: href.startsWith('http') ? href : `https://duckduckgo.com${href}`,
          source: 'web',
          engagement: 0,
        });
      }
    });

    return results.slice(0, 10);
  } catch (err) {
    console.error('[WebSearch] Failed:', err.message);
    return [];
  }
}
