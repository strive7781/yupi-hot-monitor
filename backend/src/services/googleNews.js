import Parser from 'rss-parser';

const parser = new Parser({ timeout: 10000 });

export async function searchGoogleNews(keyword) {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`;
    const feed = await parser.parseURL(url);

    return (feed.items || []).slice(0, 10).map((item) => ({
      title: item.title || '',
      content: item.contentSnippet || item.title || '',
      url: item.link || '',
      source: 'googlenews',
      engagement: 0,
      createdAt: item.pubDate,
    }));
  } catch (err) {
    console.error('[GoogleNews] Fetch failed:', err.message);
    return [];
  }
}
