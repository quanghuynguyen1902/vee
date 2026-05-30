import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { extractRandomMeetingFiles } from './utils/extractMeetings.js';
import { getAllTopics, getTopicById, saveTopic, deleteTopic, getTables, runQuery, updateRow, deleteRow, insertRow, getTopicProgress, saveTopicProgress } from './db.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ---- Rate limiters ----
const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Quá nhiều request, vui lòng thử lại sau 1 phút.' }
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Quá nhiều tin nhắn, vui lòng thử lại sau 1 phút.' }
});

// ---- Admin auth middleware ----
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ---- Topics API (SQLite) ----
app.get('/api/topics', async (req, res) => {
  try {
    const rows = await getAllTopics();
    res.json(rows);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/topics/:id', async (req, res) => {
  try {
    const topic = await getTopicById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Không tìm thấy chủ đề' });
    res.json(topic);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/topics', async (req, res) => {
  console.log('[API] POST /api/topics body:', req.body?.title, 'sentences:', req.body?.sentences?.length);
  try {
    const topic = await saveTopic(req.body);
    console.log('[API] Topic saved:', topic.id);
    res.json(topic);
  } catch (err) {
    console.error('[API] saveTopic error:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/topics/:id', async (req, res) => {
  try {
    await deleteTopic(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/progress', async (_req, res) => {
  try {
    const progress = await getTopicProgress();
    res.json(progress || {});
  } catch (err) {
    console.error('Progress load error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/progress', async (req, res) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const saved = await saveTopicProgress(payload);
    res.json(saved || {});
  } catch (err) {
    console.error('Progress save error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---- AI Generation ----
app.post('/api/generate', generateLimiter, async (req, res) => {
  const { text } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server chưa cấu hình API key' });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Vui lòng cung cấp văn bản' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'https://dichcau.app',
        'X-Title': 'DichCau'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a bilingual assistant creating English vocabulary exercises. Given Vietnamese text, produce natural-sounding Vietnamese sentences and accurate English translations. Break each English sentence into an array of meaningful tokens. Keep contractions as single tokens (e.g., "don\'t", "I\'m", "can\'t"). Keep proper nouns and multi-word terms as single tokens when they represent one semantic unit. The Vietnamese sentence should be natural, not a word-for-word translation.\n\nIMPORTANT: Use first-person perspective (I, we, my, our) instead of third-person (he, she, Tom, they). Do NOT include any specific personal names (e.g., Huy, Nguyên, Tom, Tom Nguyen, John, Mary). If a sentence needs to refer to a person, use "I", "we", or generic references like "my team" or "the team" instead of named individuals.'
          },
          {
            role: 'user',
            content: `Convert the following Vietnamese text into pairs of Vietnamese sentences and English token arrays. Each English array should contain meaningful tokens in correct order. Keep contractions as single tokens (e.g., "don't", "I'm", "can't"). Keep proper nouns and fixed phrases as single tokens when they represent one semantic unit (e.g., "New York", "machine learning"). The Vietnamese translation must be natural and accurate, not a literal word-for-word translation.\n\nCRITICAL RULES:\n- Use first-person perspective (I, we, my, our) instead of third-person.\n- NEVER include specific personal names like Huy, Nguyên, Tom, Tom Nguyen, John, Mary, etc.\n- If referring to a person, use "I", "we", "my team", or omit the name entirely.\n\nReturn ONLY a JSON object with a "sentences" array: {"sentences": [{"vi": "...", "en": ["word1", "word2", ...]}]}. Do not include markdown formatting or extra text.\n\n${text}`
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(502).json({ error: err.error?.message || `OpenRouter error: ${response.status}` });
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) content = jsonMatch[1];

    const parsed = JSON.parse(content);
    return res.json({ sentences: parsed.sentences || parsed.pairs || parsed });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message || 'Lỗi server' });
  }
});

app.post('/api/generate-from-topic', generateLimiter, async (req, res) => {
  const { topic } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server chưa cấu hình API key' });
  }

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Vui lòng cung cấp tên chủ đề' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'https://dichcau.app',
        'X-Title': 'DichCau'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a bilingual assistant creating English vocabulary exercises. Given a topic name, produce 15 natural-sounding Vietnamese sentences and accurate English translations related to that topic. Break each English sentence into an array of meaningful tokens. Keep contractions as single tokens (e.g., "don\'t", "I\'m", "can\'t"). Keep proper nouns and multi-word terms as single tokens when they represent one semantic unit. The Vietnamese sentence should be natural, not a word-for-word translation.\n\nIMPORTANT: Use first-person perspective (I, we, my, our) instead of third-person (he, she, Tom, they). Do NOT include any specific personal names (e.g., Huy, Nguyên, Tom, Tom Nguyen, John, Mary). If a sentence needs to refer to a person, use "I", "we", or generic references like "my team" or "the team" instead of named individuals.'
          },
          {
            role: 'user',
            content: `Create 15 diverse sentences about the topic "${topic.trim()}". For each sentence:\n1. A natural Vietnamese sentence that fits the topic\n2. The English sentence broken down into meaningful tokens (in correct order). Keep contractions as single tokens (e.g., "don't", "I'm", "can't"). Keep proper nouns and fixed phrases as single tokens when they represent one semantic unit.\n\nCRITICAL RULES:\n- Use first-person perspective (I, we, my, our) instead of third-person.\n- NEVER include specific personal names like Huy, Nguyên, Tom, Tom Nguyen, John, Mary, etc.\n- If referring to a person, use "I", "we", "my team", or omit the name entirely.\n\nReturn ONLY a JSON object with a "sentences" array: {"sentences": [{"vi": "...", "en": ["word1", "word2", ...]}]}. Do not include markdown formatting or extra text.`
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(502).json({ error: err.error?.message || `OpenRouter error: ${response.status}` });
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) content = jsonMatch[1];

    const parsed = JSON.parse(content);
    return res.json({ sentences: parsed.sentences || parsed.pairs || parsed });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message || 'Lỗi server' });
  }
});

app.post('/api/generate-from-meetings', generateLimiter, async (_req, res) => {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return res.status(501).json({ error: 'Chức năng này không khả dụng trên production.' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server chưa cấu hình API key' });
  }

  try {
    // Random pick 15 files from all meetings so each generation is different
    const { text, count, files } = await extractRandomMeetingFiles(15);

    if (!text || text.length < 100) {
      return res.status(400).json({ error: `Không đủ nội dung trong folder meeting (${count} file). Vui lòng thêm file meeting notes.` });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'https://dichcau.app',
        'X-Title': 'DichCau'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a bilingual assistant creating English vocabulary exercises from meeting transcripts. Summarize key discussion points into natural English sentences, then translate them into accurate, natural Vietnamese. Break each English sentence into an array of meaningful tokens. Keep contractions as single tokens (e.g., "don\'t", "I\'m", "can\'t"). Keep proper nouns and fixed phrases as single tokens when they represent one semantic unit (e.g., "New York", "machine learning"). The Vietnamese translation must convey the correct meaning, not be a literal word-for-word translation.\n\nIMPORTANT: Use first-person perspective (I, we, my, our) instead of third-person (he, she, Tom, they). Do NOT include any specific personal names (e.g., Huy, Nguyên, Tom, Tom Nguyen, John, Mary). If a sentence needs to refer to a person, use "I", "we", or generic references like "my team" or "the team" instead of named individuals.'
          },
          {
            role: 'user',
            content: `From the following meeting transcripts (extracted from ${files.length} different meeting files), create 20 diverse sentences covering different topics discussed. For each sentence:\n1. A natural Vietnamese translation that accurately conveys the meaning\n2. The English sentence broken down into meaningful tokens (in correct order). Keep contractions as single tokens (e.g., "don't", "I'm", "can't"). Keep proper nouns and fixed phrases as single tokens when they represent one semantic unit.\n\nCRITICAL RULES:\n- Use first-person perspective (I, we, my, our) instead of third-person.\n- NEVER include specific personal names like Huy, Nguyên, Tom, Tom Nguyen, John, Mary, etc.\n- If referring to a person, use "I", "we", "my team", or omit the name entirely.\n\nImportant: Each sentence should be from DIFFERENT parts of the meetings, not repetitive. Cover various topics like bugs, features, deadlines, team updates, technical discussions, etc. The Vietnamese translation must be natural, not a literal word-for-word translation.\n\nReturn ONLY a JSON object: {"sentences": [{"vi": "...", "en": ["word1", "word2", ...]}]}.\n\nMeeting transcripts:\n\n${text.substring(0, 50000)}`
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(502).json({ error: err.error?.message || `OpenRouter error: ${response.status}` });
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) content = jsonMatch[1];

    const parsed = JSON.parse(content);
    return res.json({
      sentences: parsed.sentences || parsed.pairs || parsed,
      sourceCount: count,
      filesUsed: files,
      sourcePreview: text.substring(0, 200) + '...'
    });
  } catch (err) {
    console.error('Meeting generation error:', err);
    return res.status(500).json({ error: err.message || 'Lỗi server' });
  }
});

app.post('/api/chat', chatLimiter, async (req, res) => {
  const { messages } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server chưa cấu hình API key' });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Vui lòng cung cấp tin nhắn' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'https://dichcau.app',
        'X-Title': 'DichCau'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful bilingual English-Vietnamese tutor. Help the user learn English by explaining vocabulary, grammar, and sentence structure in Vietnamese. Keep answers concise and friendly.'
          },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(502).json({ error: err.error?.message || `OpenRouter error: ${response.status}` });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || '';
    return res.json({ reply });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: err.message || 'Lỗi server' });
  }
});

// ---- Admin DB Viewer API ----
app.use('/api/admin', requireAdmin);

app.get('/api/admin/tables', async (req, res) => {
  try {
    const tables = await getTables();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/query', async (req, res) => {
  try {
    const { sql } = req.body;
    const rows = await runQuery(sql);
    res.json(rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/update', async (req, res) => {
  try {
    const { table, setClause, whereClause, values } = req.body;
    const result = await updateRow(table, setClause, whereClause, values);
    res.json({ ok: true, changes: result.changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/delete', async (req, res) => {
  try {
    const { table, whereClause, values } = req.body;
    const result = await deleteRow(table, whereClause, values);
    res.json({ ok: true, changes: result.changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/insert', async (req, res) => {
  try {
    const { table, columns, placeholders, values } = req.body;
    const result = await insertRow(table, columns, placeholders, values);
    res.json({ ok: true, lastID: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Export for Vercel serverless
export default app;

// Only start server in local dev
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}
