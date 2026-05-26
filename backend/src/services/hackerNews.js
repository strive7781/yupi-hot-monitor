const HN_API = 'https://hn.algolia.com/api/v1/search';

export async function searchHackerNews(keyword) {
  try {
    const params = new URLSearchParams({
      query: keyword,
      tags: 'story',
      hitsPerPage: '10',
    });

    const response = await fetch(`${HN_API}?${params}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return [];

    const data = await response.json();
    return (data.hits || []).map((hit) => ({
      title: hit.title || hit.story_title || '',
      content: hit.title || '',
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      source: 'hackernews',
      engagement: hit.points || 0,
      createdAt: hit.created_at,
    }));
  } catch (err) {
    console.error('[HN] Fetch failed:', err.message);
    return [];
  }
}
