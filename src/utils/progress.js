const LS_PROGRESS_KEY = 'dichcau_topic_progress_v1';

export function loadTopicProgress() {
  try {
    const raw = localStorage.getItem(LS_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveTopicProgress(progressMap) {
  localStorage.setItem(LS_PROGRESS_KEY, JSON.stringify(progressMap || {}));
}

export async function fetchTopicProgress() {
  try {
    const res = await fetch('/api/progress');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    saveTopicProgress(data);
    return data;
  } catch {
    return loadTopicProgress();
  }
}

let saveTimer = null;
export function persistTopicProgress(progressMap) {
  saveTopicProgress(progressMap);
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressMap || {})
      });
    } catch {
      // localStorage already updated as fallback
    }
  }, 300);
}

export function markTopicStarted(progressMap, topicId, mode, totalQuestions) {
  const now = Date.now();
  const prev = progressMap?.[topicId] || {};

  return {
    ...(progressMap || {}),
    [topicId]: {
      ...prev,
      inProgress: true,
      completed: false,
      lastMode: mode,
      totalQuestions: totalQuestions || prev.totalQuestions || 0,
      startedAt: prev.startedAt || now,
      lastPlayedAt: now
    }
  };
}

export function markTopicCompleted(progressMap, topicId, { score, mode, totalQuestions }) {
  const now = Date.now();
  const prev = progressMap?.[topicId] || {};

  return {
    ...(progressMap || {}),
    [topicId]: {
      ...prev,
      inProgress: false,
      completed: true,
      lastScore: score,
      lastMode: mode,
      totalQuestions: totalQuestions || prev.totalQuestions || 0,
      attempts: (prev.attempts || 0) + 1,
      session: null,
      completedAt: now,
      lastPlayedAt: now
    }
  };
}

export function updateTopicSession(progressMap, topicId, { mode, totalQuestions, session }) {
  const now = Date.now();
  const prev = progressMap?.[topicId] || {};

  return {
    ...(progressMap || {}),
    [topicId]: {
      ...prev,
      inProgress: true,
      completed: false,
      lastMode: mode,
      totalQuestions: totalQuestions || prev.totalQuestions || 0,
      session: session || null,
      startedAt: prev.startedAt || now,
      lastPlayedAt: now
    }
  };
}

export function clearTopicProgress(progressMap, topicId) {
  const next = { ...(progressMap || {}) };
  delete next[topicId];
  return next;
}
