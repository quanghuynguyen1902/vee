import { useState, useEffect } from 'react';
import { X, Database, Table, Play, Trash2, Plus, Save } from 'lucide-react';

export default function DBViewer({ onClose }) {
  const [tables, setTables] = useState([]);
  const [activeTable, setActiveTable] = useState('topics');
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [query, setQuery] = useState('SELECT * FROM topics');
  const [error, setError] = useState('');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (activeTable) {
      runQuery(`SELECT * FROM ${activeTable}`);
    }
  }, [activeTable]);

  async function fetchTables() {
    try {
      const res = await fetch('/api/admin/tables');
      const data = await res.json();
      setTables(data);
    } catch (err) {
      setError('Lỗi kết nối server');
    }
  }

  async function runQuery(sql) {
    setError('');
    try {
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.length > 0) {
        setColumns(Object.keys(data[0]));
        setRows(data);
      } else {
        setColumns([]);
        setRows([]);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(row, col, value) {
    try {
      const pkCol = columns.find(c => c === 'id') || columns[0];
      const pkVal = row[pkCol];
      
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: activeTable,
          setClause: `${col} = ?`,
          whereClause: `${pkCol} = ?`,
          values: [value, pkVal]
        })
      });
      
      if (res.ok) {
        runQuery(`SELECT * FROM ${activeTable}`);
      } else {
        const err = await res.json();
        setError(err.error);
      }
    } catch (err) {
      setError(err.message);
    }
    setEditingCell(null);
  }

  async function handleDelete(row) {
    if (!confirm('Xóa dòng này?')) return;
    try {
      const pkCol = columns.find(c => c === 'id') || columns[0];
      const pkVal = row[pkCol];
      
      await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: activeTable,
          whereClause: `${pkCol} = ?`,
          values: [pkVal]
        })
      });
      
      runQuery(`SELECT * FROM ${activeTable}`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCustomQuery() {
    runQuery(query);
  }

  function startEdit(rowIdx, col, value) {
    setEditingCell(`${rowIdx}-${col}`);
    setEditValue(value);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '85vh' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Database size={20} /> SQLite Viewer
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tables list */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          {tables.map((t) => (
            <button
              key={t.name}
              className={`btn btn-sm ${activeTable === t.name ? 'btn-primary' : ''}`}
              onClick={() => setActiveTable(t.name)}
            >
              <Table size={12} /> {t.name}
            </button>
          ))}
        </div>

        {/* Custom Query */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT * FROM ..."
            />
            <button className="btn btn-primary btn-sm" onClick={handleCustomQuery}>
              <Play size={14} /> Chạy
            </button>
          </div>
        </div>

        {error && <p className="modal-error">{error}</p>}

        {/* Data Table */}
        <div style={{ overflow: 'auto', maxHeight: '50vh', border: '1px solid var(--border)' }}>
          {rows.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>#</th>
                  {columns.map((col) => (
                    <th key={col} style={{ padding: '8px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      {col}
                    </th>
                  ))}
                  <th style={{ padding: '8px', width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 8px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{i + 1}</td>
                    {columns.map((col) => (
                      <td key={col} style={{ padding: '6px 8px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {editingCell === `${i}-${col}` ? (
                          <input
                            autoFocus
                            className="form-input"
                            style={{ padding: '4px 8px', fontSize: '0.8rem', minWidth: '100px' }}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleUpdate(row, col, editValue)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdate(row, col, editValue);
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                          />
                        ) : (
                          <span
                            onClick={() => startEdit(i, col, row[col])}
                            style={{ cursor: 'pointer', display: 'block' }}
                            title="Click để edit"
                          >
                            {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                          </span>
                        )}
                      </td>
                    ))}
                    <td style={{ padding: '6px 8px' }}>
                      <button
                        className="delete-btn"
                        style={{ opacity: 1, position: 'static' }}
                        onClick={() => handleDelete(row)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--muted)' }}>
              Không có dữ liệu
            </p>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
