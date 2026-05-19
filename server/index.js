import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { extractRandomMeetingFiles } from './utils/extractMeetings.js';
import { getAllTopics, getTopicById, saveTopic, deleteTopic, getTables, runQuery, updateRow, deleteRow, insertRow } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

function normalizeOrigin(value) {
  if (!value) return '';
  return value.trim().replace(/\/+$/, '');
}

const envOrigins = (process.env.APP_URL || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

const devOrigins = process.env.NODE_ENV === 'production'
  ? []
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const allowedOrigins = new Set([...envOrigins, ...devOrigins].map(normalizeOrigin));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, mobile apps, same-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(normalizeOrigin(origin))) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  }
}));
app.use(express.json());

// ---- Rate limiters ----
const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Quá nhiều request, vui lòng thử lại sau 1 phút.' }
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
app.get('/api/topics', (req, res) => {
  try {
    const rows = getAllTopics();
    res.json(rows);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/topics/:id', (req, res) => {
  try {
    const topic = getTopicById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Không tìm thấy chủ đề' });
    res.json(topic);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/topics', (req, res) => {
  try {
    const topic = saveTopic(req.body);
    res.json(topic);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/topics/:id', (req, res) => {
  try {
    deleteTopic(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('DB error:', err);
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
            content: 'You are a helpful assistant that creates English vocabulary exercises from Vietnamese text. For each Vietnamese sentence, provide the English translation broken down into individual words.'
          },
          {
            role: 'user',
            content: `Convert the following Vietnamese text into pairs of Vietnamese sentences and English word arrays. Return ONLY a JSON object with a "sentences" array: {"sentences": [{"vi": "...", "en": ["word1", "word2", ...]}]}. Do not include markdown formatting or extra text.\n\n${text}`
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
            content: 'You are a helpful assistant that creates English vocabulary exercises from meeting transcripts. Given meeting notes in English, create important sentences that summarize key discussion points, then translate them into Vietnamese. Break down the English translation into individual words for a word-arrangement exercise.'
          },
          {
            role: 'user',
            content: `From the following meeting transcripts (extracted from ${files.length} different meeting files), create 20 diverse sentences covering different topics discussed. For each sentence:
1. The Vietnamese translation
2. The English sentence broken down into individual words (in correct order)

Important: Each sentence should be from DIFFERENT parts of the meetings, not repetitive. Cover various topics like bugs, features, deadlines, team updates, technical discussions, etc.

Return ONLY a JSON object: {"sentences": [{"vi": "...", "en": ["word1", "word2", ...]}]}.

Meeting transcripts:\n\n${text.substring(0, 50000)}`
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

// ---- Admin DB Viewer API ----
app.use('/api/admin', requireAdmin);

app.get('/api/admin/tables', (req, res) => {
  try {
    const tables = getTables();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/query', (req, res) => {
  try {
    const { sql } = req.body;
    const rows = runQuery(sql);
    res.json(rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/update', (req, res) => {
  try {
    const { table, setClause, whereClause, values } = req.body;
    const result = updateRow(table, setClause, whereClause, values);
    res.json({ ok: true, changes: result.changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/delete', (req, res) => {
  try {
    const { table, whereClause, values } = req.body;
    const result = deleteRow(table, whereClause, values);
    res.json({ ok: true, changes: result.changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/insert', (req, res) => {
  try {
    const { table, columns, placeholders, values } = req.body;
    const result = insertRow(table, columns, placeholders, values);
    res.json({ ok: true, lastID: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
