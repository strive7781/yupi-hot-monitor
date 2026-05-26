const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const ANALYSIS_SCHEMA = {
  type: 'json_schema',
  json_schema: {
    name: 'hotspot_analysis',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        is_genuine: { type: 'boolean', description: '是否为真实热点（非营销/标题党/转载）' },
        score: { type: 'number', description: '热度评分 0-100' },
        summary: { type: 'string', description: '50字以内中文摘要' },
        reason: { type: 'string', description: '判定理由，20字以内' },
      },
      required: ['is_genuine', 'score', 'summary', 'reason'],
      additionalProperties: false,
    },
  },
};

export async function analyzeContent(title, content, source, keyword) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return fallbackAnalysis(title, content);
  }

  const systemPrompt = `你是专业的科技热点分析师，服务于 AI 编程博主。
判断给定内容是否为真实热点。过滤：营销软文、标题党、无实质内容的转载、虚假谣言。
保留：产品发布、技术突破、开源项目、行业重大事件、有影响力的讨论。
关键词上下文：「${keyword}」`;

  const userPrompt = `来源：${source}
标题：${title}
内容：${content.slice(0, 800)}`;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://yupi-hot-monitor.local',
        'X-OpenRouter-Title': 'Yupi Hot Monitor',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: ANALYSIS_SCHEMA,
        temperature: 0.3,
        max_tokens: 300,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error('[AI] OpenRouter error:', response.status, await response.text());
      return fallbackAnalysis(title, content);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    return JSON.parse(raw);
  } catch (err) {
    console.error('[AI] Analysis failed:', err.message);
    return fallbackAnalysis(title, content);
  }
}

function fallbackAnalysis(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  const spamWords = ['click here', 'buy now', 'limited offer', '免费领取', '加微信'];
  const isSpam = spamWords.some((w) => text.includes(w));
  return {
    is_genuine: !isSpam,
    score: isSpam ? 10 : 60,
    summary: title.slice(0, 50),
    reason: isSpam ? '疑似营销内容' : 'AI 不可用，默认通过',
  };
}

export async function discoverHotTopics(scope) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash',
        messages: [
          {
            role: 'user',
            content: `基于你的知识，列出「${scope}」领域当前最值得关注的前5个热点话题，每个用一行描述。只输出 JSON 数组：[{"topic":"...","reason":"..."}]`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) return [];
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(raw);
    return parsed.topics || parsed.items || (Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}
