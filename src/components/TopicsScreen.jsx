import { useState } from 'react';
import { Upload, Sparkles, Trash2, Video, Database } from 'lucide-react';

export default function TopicsScreen({
  topics,
  currentMode,
  onSetMode,
  onStartTopic,
  onOpenCreate,
  onDeleteTopic,
  onOpenImport,
  onOpenAIGenerate,
  onGenerateFromMeetings,
  onOpenDBViewer
}) {
  return (
    <section className="screen active" id="screen-topics">
      <div>
        <div className="eyebrow">Chọn bài học</div>
        <h1 className="title">Bạn muốn luyện chủ đề nào?</h1>
        <p className="subtitle" id="topics-subtitle">
          {currentMode === 'drag'
            ? 'Sắp xếp từ tiếng Anh để dịch đúng nghĩa câu tiếng Việt.'
            : 'Nhập từng từ tiếng Anh để dịch đúng nghĩa câu tiếng Việt.'}
        </p>

        <div className="mode-toggle">
          <button
            className={`mode-btn ${currentMode === 'drag' ? 'active' : ''}`}
            onClick={() => onSetMode('drag')}
          >
            Lắp ghép từ
          </button>
          <button
            className={`mode-btn ${currentMode === 'type' ? 'active' : ''}`}
            onClick={() => onSetMode('type')}
          >
            Tự điền từ
          </button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button className="btn btn-sm" onClick={onOpenImport}>
            <Upload size={14} /> Import file
          </button>
          <button className="btn btn-sm" onClick={onOpenAIGenerate}>
            <Sparkles size={14} /> AI Generate
          </button>
          <button className="btn btn-sm" onClick={onGenerateFromMeetings}>
            <Video size={14} /> Tạo từ Meeting
          </button>
          <button className="btn btn-sm" onClick={onOpenDBViewer}>
            <Database size={14} /> DB Viewer
          </button>
        </div>
      </div>

      <div className="topics-grid">
        {topics.map((t) => {
          const isCustom = !t.isBuiltIn;
          return (
            <div
              key={t.id}
              className="topic-card"
              onClick={() => onStartTopic(t.id)}
            >
              {isCustom && <span className="custom-badge">Tự tạo</span>}
              <div className="topic-name">{t.title}</div>
              <div className="topic-meta">
                {(t.sentences?.length || t.sentence_count || 0)} câu · {currentMode === 'drag' ? 'Lắp ghép từ' : 'Tự điền từ'}
              </div>
              {isCustom && (
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTopic(t.id);
                  }}
                  title="Xóa"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}

        <div className="topic-card create-card" onClick={onOpenCreate}>
          <div className="plus">+</div>
          <div className="create-label">Tạo chủ đề mới</div>
        </div>
      </div>
    </section>
  );
}
