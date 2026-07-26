import { useState } from 'react';
import {
  ArrowLeft,
  ClipboardPaste,
  Languages,
  Loader2,
  Save,
  Sparkles
} from 'lucide-react';
import { processTranscriptWithAI } from '../utils/ai';

export default function CreateTopicScreen({ onBack, onSave, onToast }) {
  const [name, setName] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [processingTranscript, setProcessingTranscript] = useState(false);
  const [rows, setRows] = useState([]);

  function updateRow(idx, field, value) {
    setRows((prev) =>
      prev.map((r) => (r.idx === idx ? { ...r, [field]: value } : r))
    );
  }

  async function handleProcessTranscript() {
    if (!paragraph.trim()) {
      onToast?.('Hãy dán transcript YouTube cần xử lý trước.', 'error');
      return;
    }

    setProcessingTranscript(true);
    try {
      const result = await processTranscriptWithAI(paragraph.trim());
      if (result.sentences.length === 0) {
        throw new Error('AI không tạo được câu nào từ transcript.');
      }

      setRows(
        result.sentences.map((sentence, index) => ({
          idx: index + 1,
          vi: sentence.vi,
          en: Array.isArray(sentence.en) ? sentence.en.join(' ') : sentence.en
        }))
      );
      if (!name.trim() && result.title) setName(result.title);
      onToast?.(
        `Đã làm sạch, dịch và điền ${result.sentences.length} câu từ transcript.`,
        'success'
      );
    } catch (err) {
      onToast?.(err.message || 'Không thể xử lý transcript.', 'error');
    } finally {
      setProcessingTranscript(false);
    }
  }

  function handleSave() {
    if (rows.length === 0) {
      onToast?.('Hãy để AI xử lý văn bản tiếng Anh trước.', 'error');
      return;
    }

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
            Dán văn bản tiếng Anh để AI biến nội dung thành bài luyện tập song ngữ.
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

        <div className="paragraph-import">
          <div className="paragraph-import-heading">
            <div>
              <div className="form-label paragraph-import-label">
                <ClipboardPaste size={16} /> Dán văn bản tiếng Anh
              </div>
              <p className="hint-text">
                Có thể dán transcript YouTube còn timestamp và lỗi nhận dạng.
                AI sẽ làm sạch, chia câu và dịch sang tiếng Việt.
              </p>
            </div>
            <div className="paragraph-import-actions">
              <button
                className="btn btn-sm btn-ai"
                type="button"
                onClick={handleProcessTranscript}
                disabled={!paragraph.trim() || processingTranscript}
              >
                {processingTranscript
                  ? <Loader2 size={16} className="spin" />
                  : <Sparkles size={16} />}
                {processingTranscript ? 'AI đang xử lý...' : 'AI xử lý transcript'}
              </button>
            </div>
          </div>
          <textarea
            className="form-textarea paragraph-import-input"
            placeholder={'Dán nội dung vào đây, kể cả transcript có timestamp như:\n0:12 Hello and welcome...\n0:18 Today we are talking about...'}
            value={paragraph}
            onChange={(event) => {
              setParagraph(event.target.value);
              if (rows.length > 0) setRows([]);
            }}
            disabled={processingTranscript}
          />
        </div>

        {rows.length > 0 && (
          <>
            <div className="processed-sentences-heading">
              AI đã tạo {rows.length} cặp câu. Bạn có thể chỉnh sửa trước khi lưu.
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
          </>
        )}

        <div className="form-actions">
          <button className="btn" onClick={onBack}>Hủy</button>
          {rows.length > 0 && (
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={17} /> Lưu chủ đề
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
