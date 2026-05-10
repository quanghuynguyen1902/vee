// Client-side storage utils - now backed by SQLite via backend API
// Built-in topics remain client-side

const LS_KEY = 'dichcau_custom_topics';

// Fallback to localStorage if backend is down
function getLocalTopics() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveLocalTopics(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// API wrappers
export async function fetchTopics() {
  try {
    const res = await fetch('/api/topics');
    if (!res.ok) throw new Error('API error');
    const rows = await res.json();
    // Map DB rows to app format
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      isBuiltIn: false,
      source: r.source,
      sentences: [] // populated when needed via getTopic
    }));
  } catch (err) {
    console.warn('Backend unavailable, using localStorage:', err.message);
    return getLocalTopics();
  }
}

export async function getTopic(id) {
  try {
    const res = await fetch(`/api/topics/${id}`);
    if (!res.ok) throw new Error('API error');
    const topic = await res.json();
    return {
      ...topic,
      isBuiltIn: false
    };
  } catch (err) {
    console.warn('Backend unavailable, using localStorage:', err.message);
    const local = getLocalTopics();
    return local.find(t => t.id === id) || null;
  }
}

export async function saveCustomTopic(topic) {
  try {
    const res = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic)
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, saving to localStorage:', err.message);
    const local = getLocalTopics();
    const idx = local.findIndex(t => t.id === topic.id);
    if (idx >= 0) local[idx] = topic;
    else local.push(topic);
    saveLocalTopics(local);
    return topic;
  }
}

export async function deleteCustomTopic(id) {
  try {
    const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('API error');
  } catch (err) {
    console.warn('Backend unavailable, deleting from localStorage:', err.message);
    const local = getLocalTopics().filter(t => t.id !== id);
    saveLocalTopics(local);
  }
}

export async function getCustomTopics() {
  return fetchTopics();
}

export async function saveCustomTopics(list) {
  saveLocalTopics(list);
}
