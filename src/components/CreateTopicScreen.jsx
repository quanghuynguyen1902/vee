import { useState } from 'react';

export default function CreateTopicScreen({ onBack, onSave, onToast }) {
  const [name, setName] = useState('');
  const [rows, setRows] = useState(
    Array.from({ length: 5 }, (_, i) => ({ vi: '', en: '', idx: i + 1 }))
  );

  function updateRow(idx, field, value) {
    setRows((prev) =>
      prev.map((r) => (r.idx === idx ? { ...r, [field]: value } : r))
    );
  }

  function handleSave() {
    if (!name.trim()) {
      onToast?.('Vui lòng nhập tên chủ đề.', 'error');
      return;
    }

    const sentences = [];
    for (const row of rows) {
      const vi = row.vi.trim();
      const enRaw = row.en.trim();
      if (!vi || !enRaw) {
        onToast?.(`Vui lòng điền đầy đủ câu ${row.idx}.`, 'error');
        return;
      }
      const en = enRaw.split(/\s+/).filter(Boolean);
      if (en.length === 0) {
        onToast?.(`Câu ${row.idx} cần có ít nhất một từ tiếng Anh.`, 'error');
        return;
      }
      sentences.push({ vi, en });
    }

    onSave({ id: 'custom_' + Date.now(), title: name, sentences });
  }

  return (
    <section className="screen active" id="screen-create-topic">
      <div className="play-header" style={{ marginBottom: 'var(--space-6)' }}>
        <button className="back-link" onClick={onBack}>
          ← Quay lại
        </button>
      </div>

      <div className="eyebrow">Tạo mới</div>
      <h1 className="title" style={{ marginBottom: 'var(--space-2)' }}>
        Tạo chủ đề của bạn
      </h1>
      <p className="subtitle" style={{ marginBottom: 'var(--space-8)' }}>
        Nhập 5 câu tiếng Việt và các từ tiếng Anh tương ứng. App sẽ tạo bài tập từ dữ liệu này.
      </p>

      <div className="form-group">
        <label className="form-label" htmlFor="ct-name">
          Tên chủ đề
        </label>
        <input
          className="form-input"
          id="ct-name"
          type="text"
          placeholder="Ví dụ: Công nghệ, Thể thao, Âm nhạc..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div id="sentence-rows">
        {rows.map((row) => (
          <div className="sentence-row" key={row.idx}>
            <div className="sentence-row-header">Câu {row.idx}</div>
            <div className="sentence-row-grid">
              <div>
                <label className="form-label">Tiếng Việt</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Nhập câu tiếng Việt..."
                  value={row.vi}
                  onChange={(e) => updateRow(row.idx, 'vi', e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">
                  Từ tiếng Anh{' '}
                  <span style={{ fontWeight: 400, color: 'var(--muted)' }}>
                    (cách nhau bằng dấu cách)
                  </span>
                </label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="VD: Hello how are you"
                  value={row.en}
                  onChange={(e) => updateRow(row.idx, 'en', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hint-text">
        Mỗi dòng: câu tiếng Việt ở ô trái, các từ tiếng Anh (cách nhau bằng dấu cách) ở ô phải.
      </div>

      <div className="form-actions">
        <button className="btn" onClick={onBack}>
          Hủy
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Lưu chủ đề
        </button>
      </div>
    </section>
  );
}
