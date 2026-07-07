const POLL_INTERVAL = 5000;
const MAX_POLLS = 120;

export async function submitGeneration(cfg, title, style, prompt, instrumental = false) {
  if (!cfg || !cfg.apiKey) return { ok: false, errorKind: 'auth', message: 'No API key configured for generation — set it in Settings.' };
  if (!cfg.baseUrl) return { ok: false, errorKind: 'auth', message: 'No base URL configured for generation — set it in Settings.' };
  const baseUrl = cfg.baseUrl.replace(/\/+$/, '');
  const callBackUrl = cfg.callBackUrl || 'https://example.com/suno-callback';
  const body = {
    customMode: true,
    instrumental,
    callBackUrl,
    model: cfg.model || 'V5_5',
    title,
    style: style || '',
    prompt,
  };
  try {
    const resp = await fetch(baseUrl + '/api/v1/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey },
      body: JSON.stringify(body),
    });
    const json = await resp.json();
    if (json.code !== 200) {
      const map = { 401: 'auth', 429: 'quota', 430: 'rate_limit', 413: 'too_long', 455: 'maintenance' };
      const kind = map[json.code] || 'provider_error';
      const msg = json.msg || 'Generation rejected (code ' + json.code + ')';
      return { ok: false, errorKind: kind, message: msg };
    }
    if (!json.data || !json.data.taskId) {
      return { ok: false, errorKind: 'provider_error', message: 'No taskId in response.' };
    }
    return { ok: true, data: { taskId: json.data.taskId } };
  } catch (e) {
    const msg = e.message || String(e);
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return { ok: false, errorKind: 'cors_or_network', message: 'Network/CORS error. The provider may not be reachable from the browser.' };
    }
    return { ok: false, errorKind: 'provider_error', message: msg };
  }
}

export async function pollGeneration(cfg, taskId, onProgress) {
  const baseUrl = cfg.baseUrl.replace(/\/+$/, '');
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
    try {
      const resp = await fetch(baseUrl + '/api/v1/generate/record-info?taskId=' + encodeURIComponent(taskId), {
        headers: { 'Authorization': 'Bearer ' + cfg.apiKey },
      });
      const json = await resp.json();
      if (json.code !== 200) {
        return { ok: false, errorKind: 'provider_error', message: json.msg || 'Poll failed (code ' + json.code + ')' };
      }
      const d = json.data;
      if (!d) {
        return { ok: false, errorKind: 'provider_error', message: 'Empty poll response.' };
      }
      const status = d.status || '';
      if (status === 'SUCCESS' || status === 'TEXT_SUCCESS' || status === 'FIRST_SUCCESS') {
        const tracks = (d.response && d.response.sunoData) || [];
        if (tracks.length === 0) {
          if (i < 5) continue;
          return { ok: false, errorKind: 'provider_error', message: 'No tracks after generation completed.' };
        }
        return { ok: true, data: { status, tracks } };
      }
      if (status === 'CREATE_TASK_FAILED' || status === 'GENERATE_AUDIO_FAILED') {
        const errMsg = d.errorMessage || d.errorCode || 'Generation failed (' + status + ')';
        return { ok: false, errorKind: 'provider_error', message: errMsg };
      }
      if (status === 'SENSITIVE_WORD_ERROR') {
        return { ok: false, errorKind: 'content_policy', message: 'Content flagged by Suno policy. Try different lyrics.' };
      }
      if (status && status.includes('FAILED')) {
        return { ok: false, errorKind: 'provider_error', message: d.errorMessage || 'Generation failed (' + status + ')' };
      }
      if (onProgress) onProgress(status);
    } catch (e) {
      return { ok: false, errorKind: 'provider_error', message: e.message || String(e) };
    }
  }
  return { ok: false, errorKind: 'timeout', message: 'Generation timed out after ' + ((MAX_POLLS * POLL_INTERVAL) / 60000).toFixed(0) + ' min.' };
}
