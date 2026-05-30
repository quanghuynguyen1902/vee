// Conditional DB: local dev uses SQLite, Vercel uses PostgreSQL
const isLocal = !process.env.VERCEL;

let db;
if (isLocal) {
  db = await import('./db-sqlite.js');
} else {
  db = await import('./db-postgres.js');
}

export const getAllTopics = db.getAllTopics;
export const getTopicById = db.getTopicById;
export const saveTopic = db.saveTopic;
export const deleteTopic = db.deleteTopic;
export const clearAllTopics = db.clearAllTopics;
export const getTables = db.getTables;
export const runQuery = db.runQuery;
export const updateRow = db.updateRow;
export const deleteRow = db.deleteRow;
export const insertRow = db.insertRow;
