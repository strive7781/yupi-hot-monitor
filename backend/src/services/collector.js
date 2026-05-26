import db from '../db/index.js';
import { searchTwitter } from './twitter.js';
import { searchWeb } from './webSearch.js';
import { searchHackerNews } from './hackerNews.js';
import { searchGoogleNews } from './googleNews.js';
import { analyzeContent } from './ai.js';
import { sendNotification } from './notification.js';

const existsStmt = db.prepare('SELECT id FROM hotspots WHERE url = ?');
const insertHotspot = db.prepare(`
  INSERT INTO hotspots (title, summary, url, source, keyword, score, is_genuine, raw_content)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

export async function collectForKeyword(keyword) {
  console.log(`[Collector] Scanning keyword: "${keyword}"`);

  const [twitter, web, hn, gnews] = await Promise.allSettled([
    searchTwitter(keyword),
    searchWeb(keyword),
    searchHackerNews(keyword),
    searchGoogleNews(keyword),
  ]);

  const items = [
    ...(twitter.status === 'fulfilled' ? twitter.value : []),
    ...(web.status === 'fulfilled' ? web.value : []),
    ...(hn.status === 'fulfilled' ? hn.value : []),
    ...(gnews.status === 'fulfilled' ? gnews.value : []),
  ];

  console.log(`[Collector] Found ${items.length} raw items for "${keyword}"`);

  const newHotspots = [];
  for (const item of items) {
    if (!item.url || !item.title) continue;
    if (existsStmt.get(item.url)) continue;

    const analysis = await analyzeContent(item.title, item.content, item.source, keyword);
    if (!analysis.is_genuine || analysis.score < 40) {
      console.log(`[Collector] Filtered: "${item.title.slice(0, 40)}" (${analysis.reason})`);
      continue;
    }

    const result = insertHotspot.run(
      item.title,
      analysis.summary,
      item.url,
      item.source,
      keyword,
      analysis.score,
      1,
      item.content
    );

    const hotspot = {
      id: result.lastInsertRowid,
      title: item.title,
      summary: analysis.summary,
      url: item.url,
      source: item.source,
      keyword,
      score: analysis.score,
      reason: analysis.reason,
    };

    newHotspots.push(hotspot);
    await sendNotification(hotspot);
  }

  return newHotspots;
}

export async function runFullScan() {
  const keywords = db.prepare('SELECT * FROM keywords WHERE enabled = 1').all();
  if (keywords.length === 0) {
    console.log('[Collector] No keywords configured');
    return { scanned: 0, newHotspots: [] };
  }

  const allNew = [];
  for (const kw of keywords) {
    const found = await collectForKeyword(kw.keyword);
    allNew.push(...found);
  }

  console.log(`[Collector] Scan complete. ${allNew.length} new hotspots.`);
  return { scanned: keywords.length, newHotspots: allNew };
}
