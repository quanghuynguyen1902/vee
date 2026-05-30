import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../data/dichcau.db');

// Ensure data dir exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    source TEXT DEFAULT 'custom',
    created_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS sentences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id TEXT NOT NULL,
    vi TEXT NOT NULL,
    en TEXT NOT NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sentences_topic ON sentences(topic_id);
`);

export async function getAllTopics() {
  const stmt = db.prepare(`
    SELECT t.id, t.title, t.source, t.created_at,
      (SELECT COUNT(*) FROM sentences s WHERE s.topic_id = t.id) as sentence_count
    FROM topics t
    ORDER BY t.created_at DESC
  `);
  return stmt.all();
}

export async function getTopicById(id) {
  const topicStmt = db.prepare('SELECT * FROM topics WHERE id = ?');
  const topic = topicStmt.get(id);
  if (!topic) return null;

  const sentencesStmt = db.prepare('SELECT vi, en FROM sentences WHERE topic_id = ? ORDER BY id');
  const rows = sentencesStmt.all(id);

  return {
    ...topic,
    sentences: rows.map(r => ({
      vi: r.vi,
      en: JSON.parse(r.en)
    }))
  };
}

export async function saveTopic(topic) {
  const insertTopic = db.prepare('INSERT OR REPLACE INTO topics (id, title, source) VALUES (?, ?, ?)');
  const deleteSentences = db.prepare('DELETE FROM sentences WHERE topic_id = ?');
  const insertSentence = db.prepare('INSERT INTO sentences (topic_id, vi, en) VALUES (?, ?, ?)');

  db.exec('BEGIN');
  try {
    insertTopic.run(topic.id, topic.title, topic.source || 'custom');
    deleteSentences.run(topic.id);
    for (const s of topic.sentences) {
      insertSentence.run(topic.id, s.vi, JSON.stringify(s.en));
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return topic;
}

export async function deleteTopic(id) {
  const stmt = db.prepare('DELETE FROM topics WHERE id = ?');
  stmt.run(id);
}

export async function getTables() {
  const stmt = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `);
  return stmt.all();
}

export async function runQuery(sql) {
  const trimmed = sql.trim().toUpperCase();
  const isSafe = trimmed.startsWith('SELECT') || trimmed.startsWith('WITH');

  if (!isSafe) {
    throw new Error('Chỉ cho phép truy vấn SELECT');
  }

  const stmt = db.prepare(sql);
  return stmt.all();
}

export async function updateRow(table, setClause, whereClause, values) {
  const allowedTables = ['topics', 'sentences'];
  if (!allowedTables.includes(table)) {
    throw new Error('Table không hợp lệ');
  }

  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  const stmt = db.prepare(sql);
  return stmt.run(...values);
}

export async function deleteRow(table, whereClause, values) {
  const allowedTables = ['topics', 'sentences'];
  if (!allowedTables.includes(table)) {
    throw new Error('Table không hợp lệ');
  }

  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
  const stmt = db.prepare(sql);
  return stmt.run(...values);
}

export async function insertRow(table, columns, placeholders, values) {
  const allowedTables = ['topics', 'sentences'];
  if (!allowedTables.includes(table)) {
    throw new Error('Table không hợp lệ');
  }

  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  const stmt = db.prepare(sql);
  return stmt.run(...values);
}
