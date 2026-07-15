import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { generateFromTopic } from '../utils/ai';
import { smartJoin } from '../utils/text';

export default function AiGenerateModal({ onClose, onGenerate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [topicName, setTopicName] = useState('');

  async function handleGenerate() {
    if (!topicName.trim()) {
      setError('Vui lòng nhập tên chủ đề.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const sentences = await generateFromTopic(topicName.trim());
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
          <div className="modal-heading">
            <div className="modal-feature-icon"><Sparkles size={19} /></div>
            <div>
              <div className="eyebrow">Vee AI</div>
              <h2>Tạo chủ đề bằng AI</h2>
            </div>
          </div>
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
                placeholder="VD: Công nghệ, Sức khỏe, Du lịch..."
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
              />
              <p className="hint-text" style={{ marginTop: 'var(--space-2)' }}>
                Vee sẽ tạo 10 câu luyện dịch B1–B2 từ những tình huống thực tế thuộc chủ đề bạn nhập.
              </p>
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
                  <div className="preview-en">{Array.isArray(s.en) ? smartJoin(s.en) : s.en}</div>
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
