import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { generatePairsWithAI } from '../utils/ai';

export default function AiGenerateModal({ onClose, onGenerate }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [topicName, setTopicName] = useState('');

  async function handleGenerate() {
    if (!text.trim()) {
      setError('Vui lòng nhập văn bản tiếng Việt.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const sentences = await generatePairsWithAI(text);
      if (!sentences || sentences.length === 0) {
        setError('Không tạo được câu nào. Vui lòng thử lại.');
      } else {
        setPreview(sentences);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi gọi AI');
    } finally {
      setLoading(false);
    }
  }

  function confirmGenerate() {
    if (!preview || preview.length === 0) return;
    onGenerate({
      id: 'ai_' + Date.now(),
      title: topicName.trim() || 'Chủ đề AI',
      sentences: preview
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>AI Generate</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {!preview ? (
          <>
            <div className="form-group">
              <label className="form-label">Tên chủ đề</label>
              <input
                className="form-input"
                type="text"
                placeholder="VD: Công nghệ, Sức khỏe..."
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Văn bản tiếng Việt</label>
              <textarea
                className="form-textarea"
                rows={6}
                placeholder="Dán văn bản tiếng Việt vào đây. AI sẽ tự động tách câu và tạo bản dịch tiếng Anh..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            {error && <p className="modal-error">{error}</p>}

            <div className="modal-actions">
              <button className="btn" onClick={onClose}>Hủy</button>
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                {loading ? ' Đang tạo...' : ' Tạo câu'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="preview-title">
              Tạo được {preview.length} câu
            </p>
            <div className="preview-list" style={{ maxHeight: '320px', overflow: 'auto' }}>
              {preview.map((s, i) => (
                <div className="preview-item" key={i}>
                  <div className="preview-vi">{s.vi}</div>
                  <div className="preview-en">{Array.isArray(s.en) ? s.en.join(' ') : s.en}</div>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setPreview(null)}>
                Quay lại
              </button>
              <button className="btn btn-primary" onClick={confirmGenerate}>
                Lưu chủ đề
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
