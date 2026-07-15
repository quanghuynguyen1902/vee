import { useState } from 'react';
import { ArrowLeft, Languages, Save } from 'lucide-react';

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
      <div className="page-nav">
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={17} /> Quay lại
        </button>
      </div>

      <div className="page-heading">
        <div className="page-heading-icon"><Languages size={22} /></div>
        <div>
          <div className="eyebrow">Bộ câu của riêng bạn</div>
          <h1 className="title">Tạo chủ đề mới</h1>
          <p className="subtitle">
            Thêm 5 câu song ngữ để biến nội dung bạn quan tâm thành một bài luyện tập mới.
          </p>
        </div>
      </div>

      <div className="create-form-card">
        <div className="form-group topic-name-field">
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
              <div className="sentence-row-header"><span>{row.idx}</span> Cặp câu</div>
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
                    Tiếng Anh{' '}
                    <span className="label-note">(cách nhau bằng dấu cách)</span>
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Ví dụ: Hello how are you"
                    value={row.en}
                    onChange={(e) => updateRow(row.idx, 'en', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hint-text form-hint">
          Vee sẽ tách câu tiếng Anh thành từng từ để tạo bài tập lắp ghép hoặc tự điền.
        </div>

        <div className="form-actions">
          <button className="btn" onClick={onBack}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={17} /> Lưu chủ đề
          </button>
        </div>
      </div>
    </section>
  );
}
