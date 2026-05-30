import pg from 'pg';

const { Pool } = pg;

let pool = null;
let initialized = false;

function getPool() {
  if (!pool) {
    const isLocal = process.env.DATABASE_URL?.includes('localhost');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isLocal ? false : { rejectUnauthorized: false }
    });
    console.log('[DB] Pool created. DATABASE_URL present:', !!process.env.DATABASE_URL);
  }
  return pool;
}

async function ensureInit() {
  if (initialized) return;
  try {
    const p = getPool();
    await p.query(`
      CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        source TEXT DEFAULT 'custom',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sentences (
        id SERIAL PRIMARY KEY,
        topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        vi TEXT NOT NULL,
        en TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sentences_topic ON sentences(topic_id);

      CREATE TABLE IF NOT EXISTS topic_progress (
        topic_id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    initialized = true;
    console.log('[DB] Schema initialized OK');
  } catch (err) {
    console.error('[DB] Schema init failed:', err.message);
    throw err;
  }
}

export async function getAllTopics() {
  await ensureInit();
  const result = await getPool().query(`
    SELECT t.id, t.title, t.source, t.created_at,
      (SELECT COUNT(*) FROM sentences s WHERE s.topic_id = t.id) as sentence_count
    FROM topics t
    ORDER BY t.created_at DESC
  `);
  return result.rows;
}

export async function getTopicById(id) {
  await ensureInit();
  const topicResult = await getPool().query('SELECT * FROM topics WHERE id = $1', [id]);
  const topic = topicResult.rows[0];
  if (!topic) return null;

  const sentencesResult = await getPool().query(
    'SELECT vi, en FROM sentences WHERE topic_id = $1 ORDER BY id',
    [id]
  );

  return {
    ...topic,
    sentences: sentencesResult.rows.map(r => ({
      vi: r.vi,
      en: JSON.parse(r.en)
    }))
  };
}

export async function saveTopic(topic) {
  await ensureInit();
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'INSERT INTO topics (id, title, source) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, source = EXCLUDED.source',
      [topic.id, topic.title, topic.source || 'custom']
    );

    await client.query('DELETE FROM sentences WHERE topic_id = $1', [topic.id]);

    for (const s of topic.sentences) {
      await client.query(
        'INSERT INTO sentences (topic_id, vi, en) VALUES ($1, $2, $3)',
        [topic.id, s.vi, JSON.stringify(s.en)]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return topic;
}

export async function deleteTopic(id) {
  await ensureInit();
  await getPool().query('DELETE FROM topics WHERE id = $1', [id]);
}

export async function clearAllTopics() {
  await ensureInit();
  await getPool().query('DELETE FROM sentences');
  await getPool().query('DELETE FROM topics');
}

export async function getTables() {
  await ensureInit();
  const result = await getPool().query(`
    SELECT tablename as name FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  return result.rows;
}

export async function runQuery(sql) {
  await ensureInit();
  const trimmed = sql.trim().toUpperCase();
  const isSafe = trimmed.startsWith('SELECT') || trimmed.startsWith('WITH');

  if (!isSafe) {
    throw new Error('Chỉ cho phép truy vấn SELECT');
  }

  const result = await getPool().query(sql);
  return result.rows;
}

export async function updateRow(table, setClause, whereClause, values) {
  await ensureInit();
  const allowedTables = ['topics', 'sentences'];
  if (!allowedTables.includes(table)) {
    throw new Error('Table không hợp lệ');
  }

  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  const result = await getPool().query(sql, values);
  return { changes: result.rowCount };
}

export async function deleteRow(table, whereClause, values) {
  await ensureInit();
  const allowedTables = ['topics', 'sentences'];
  if (!allowedTables.includes(table)) {
    throw new Error('Table không hợp lệ');
  }

  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
  const result = await getPool().query(sql, values);
  return { changes: result.rowCount };
}

export async function insertRow(table, columns, placeholders, values) {
  await ensureInit();
  const allowedTables = ['topics', 'sentences'];
  if (!allowedTables.includes(table)) {
    throw new Error('Table không hợp lệ');
  }

  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING id`;
  const result = await getPool().query(sql, values);
  return { lastInsertRowid: result.rows[0]?.id };
}

export async function getTopicProgress() {
  await ensureInit();
  const result = await getPool().query('SELECT topic_id, data FROM topic_progress');
  const map = {};
  for (const row of result.rows) {
    map[row.topic_id] = row.data || {};
  }
  return map;
}

export async function saveTopicProgress(progressMap) {
  await ensureInit();
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM topic_progress');
    for (const [topicId, data] of Object.entries(progressMap || {})) {
      await client.query(
        `
          INSERT INTO topic_progress (topic_id, data, updated_at)
          VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
          ON CONFLICT (topic_id) DO UPDATE SET
            data = EXCLUDED.data,
            updated_at = CURRENT_TIMESTAMP
        `,
        [topicId, JSON.stringify(data || {})]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return progressMap || {};
}
