export async function llmCall(cfg, slot, systemPrompt, userPrompt, { expectJson = true } = {}) {
  const timeoutMs = 180000;
  if (!cfg || !cfg.apiKey) return { ok: false, errorKind: 'auth', message: 'No API key configured for ' + slot + ' — set it in Settings.' };
  if (!cfg.baseUrl) return { ok: false, errorKind: 'auth', message: 'No base URL configured for ' + slot + ' — set it in Settings.' };
  const baseUrl = cfg.baseUrl.replace(/\/+$/, '');
  let url = baseUrl + '/chat/completions';
  if (cfg.corsProxy) { url = cfg.corsProxy + encodeURIComponent(url); }
  const isComposer = slot === 'composer';
  const body = { model: cfg.model || 'deepseek-v4-flash', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], temperature: cfg.temperature ?? (isComposer ? 0.85 : 0.2), max_tokens: cfg.maxTokens ?? 16384 };
  if (expectJson) body.response_format = { type: 'json_object' };
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey }, body: JSON.stringify(body), signal: controller.signal });
    clearTimeout(timer);
    if (resp.status === 401 || resp.status === 403) { const msg = await resp.text().catch(() => ''); return { ok: false, errorKind: 'auth', message: 'Key rejected (' + resp.status + '). Verify your API key.' + (msg ? ' ' + msg.slice(0, 200) : '') }; }
    if (resp.status === 429) return { ok: false, errorKind: 'rate_limit', message: 'Rate limited. Wait a moment and retry.' };
    if (!resp.ok) { const msg = await resp.text().catch(() => ''); return { ok: false, errorKind: 'provider_error', message: 'Provider error (' + resp.status + ')' + (msg ? ': ' + msg.slice(0, 300) : '') }; }
    const data = await resp.json(); const content = data?.choices?.[0]?.message?.content; const finish = data?.choices?.[0]?.finish_reason;
    if (!content) { if (finish === 'length') return { ok: false, errorKind: 'bad_json', message: 'Response empty (max_tokens too short or reasoning ate tokens). Try increasing max_tokens.' }; return { ok: false, errorKind: 'bad_json', message: 'Empty response from model.' }; }
    if (!expectJson) return { ok: true, data: content };
    let json;
    try { const cleaned = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim(); json = JSON.parse(cleaned); } catch (e) { return { ok: false, errorKind: 'bad_json', message: 'Failed to parse response as JSON. Raw: ' + content.slice(0, 300) }; }
    return { ok: true, data: json };
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') return { ok: false, errorKind: 'timeout', message: 'Request timed out after ' + (timeoutMs / 1000) + 's.' };
    const msg = e.message || String(e);
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS') || msg.includes('network')) return { ok: false, errorKind: 'cors_or_network', message: 'Network/CORS error. The provider may not allow browser calls. Set a proxy base URL in Settings.' };
    return { ok: false, errorKind: 'provider_error', message: msg };
  }
}
