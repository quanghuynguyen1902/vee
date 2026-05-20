import { useState, useRef } from 'react';
import { X, FileText } from 'lucide-react';
import { parseFile, parseSentences } from '../utils/fileParser';
import { smartJoin } from '../utils/text';

export default function ImportModal({ onClose, onImport }) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  async function handleFile(file) {
    setError('');
    setPreview(null);
    setLoading(true);
    try {
      const text = await parseFile(file);
      const sentences = parseSentences(text);
      if (sentences.length === 0) {
        setError('Không tìm thấy câu nào trong file. Định dạng hỗ trợ: Mỗi dòng "Tiếng Việt | Tiếng Anh" hoặc cặp dòng liên tiếp.');
      } else {
        setPreview(sentences);
        setFileName(file.name);
      }
    } catch (err) {
      setError(err.message || 'Lỗi đọc file');
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onFileChange(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
  }

  function confirmImport() {
    if (!preview || preview.length === 0) return;
    const topicName = fileName.replace(/\.[^/.]+$/, '');
    onImport({
      id: 'import_' + Date.now(),
      title: topicName || 'Chủ đề import',
      sentences: preview
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import chủ đề từ file</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div
          className={`dropzone ${dragOver ? 'active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <FileText size={32} />
          <p>Kéo thả file hoặc click để chọn</p>
          <span className="dropzone-hint">Hỗ trợ .docx, .txt, .md</span>
          <input
            ref={inputRef}
            type="file"
            accept=".docx,.txt,.md"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </div>

        {loading && <p className="modal-loading">Đang đọc file...</p>}
        {error && <p className="modal-error">{error}</p>}

        {preview && (
          <div className="preview-section">
            <p className="preview-title">
              Tìm thấy {preview.length} câu trong <strong>{fileName}</strong>
            </p>
            <div className="preview-list">
              {preview.slice(0, 5).map((s, i) => (
                <div className="preview-item" key={i}>
                  <div className="preview-vi">{s.vi}</div>
                  <div className="preview-en">{smartJoin(s.en)}</div>
                </div>
              ))}
              {preview.length > 5 && (
                <div className="preview-more">...và {preview.length - 5} câu khác</div>
              )}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Hủy</button>
          <button
            className="btn btn-primary"
            disabled={!preview}
            onClick={confirmImport}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
