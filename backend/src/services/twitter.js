const BASE_URL = 'https://api.twitterapi.io/twitter/tweet/advanced_search';

export async function searchTwitter(keyword) {
  const apiKey = process.env.TWITTER_API_KEY;
  if (!apiKey) {
    console.warn('[Twitter] TWITTER_API_KEY not configured, skipping');
    return [];
  }

  try {
    const params = new URLSearchParams({
      query: keyword,
      queryType: 'Latest',
      cursor: '',
    });

    const response = await fetch(`${BASE_URL}?${params}`, {
      headers: { 'X-API-Key': apiKey },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error('[Twitter] API error:', response.status);
      return [];
    }

    const data = await response.json();
    return (data.tweets || []).map((tweet) => ({
      title: `@${tweet.author?.userName || 'unknown'}: ${tweet.text?.slice(0, 100)}`,
      content: tweet.text || '',
      url: tweet.url || `https://twitter.com/i/status/${tweet.id}`,
      source: 'twitter',
      engagement: (tweet.likeCount || 0) + (tweet.retweetCount || 0) * 2,
      createdAt: tweet.createdAt,
    }));
  } catch (err) {
    console.error('[Twitter] Fetch failed:', err.message);
    return [];
  }
}
