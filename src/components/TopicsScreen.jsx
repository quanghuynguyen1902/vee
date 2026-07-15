import {
  ArrowUpRight,
  BookOpenText,
  Database,
  Keyboard,
  MousePointerClick,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Trash2
} from 'lucide-react';

export default function TopicsScreen({
  topics,
  topicProgress,
  currentMode,
  onSetMode,
  onStartTopic,
  onOpenCreate,
  onDeleteTopic,
  onOpenAIGenerate,
  onOpenDBViewer
}) {
  return (
    <section className="screen active" id="screen-topics">
      <div className="topics-hero">
        <div className="hero-copy">
          <div className="eyebrow eyebrow-pill">
            <Sparkles size={14} /> Học theo nhịp của bạn
          </div>
          <h1 className="title">
            Chọn một chủ đề.<br />
            <span>Chinh phục từng câu.</span>
          </h1>
          <p className="subtitle" id="topics-subtitle">
            {currentMode === 'drag'
              ? 'Lắp ghép từ, ghi nhớ cấu trúc và biến mỗi câu tiếng Việt thành tiếng Anh tự nhiên.'
              : 'Tự điền từng từ để rèn phản xạ và làm chủ cách diễn đạt tiếng Anh.'}
          </p>
        </div>

        <div className="practice-settings">
          <div className="settings-heading">
            <div className="settings-icon"><SlidersHorizontal size={18} /></div>
            <div>
              <strong>Cách luyện tập</strong>
              <span>Chọn chế độ phù hợp với bạn</span>
            </div>
          </div>
          <div className="mode-toggle">
            <button
              className={`mode-btn ${currentMode === 'drag' ? 'active' : ''}`}
              onClick={() => onSetMode('drag')}
            >
              <MousePointerClick size={17} />
              <span><strong>Lắp ghép</strong><small>Chọn và sắp xếp từ</small></span>
            </button>
            <button
              className={`mode-btn ${currentMode === 'type' ? 'active' : ''}`}
              onClick={() => onSetMode('type')}
            >
              <Keyboard size={17} />
              <span><strong>Tự điền</strong><small>Gõ từng từ chính xác</small></span>
            </button>
          </div>
        </div>
      </div>

      <div className="topics-section-heading">
        <div>
          <div className="eyebrow">Thư viện luyện tập</div>
          <h2>Chủ đề của bạn</h2>
        </div>
        <div className="topic-actions">
          <button className="btn btn-sm btn-ai" onClick={onOpenAIGenerate}>
            <Sparkles size={15} /> Tạo bằng AI
          </button>
          <button className="btn btn-sm btn-utility" onClick={onOpenDBViewer}>
            <Database size={15} /> Dữ liệu
          </button>
        </div>
      </div>

      <div className="topics-grid">
        {topics.map((t, index) => {
          const isCustom = !t.isBuiltIn;
          const progress = topicProgress?.[t.id];
          const totalQuestions = progress?.totalQuestions || (t.sentences?.length || t.sentence_count || 0);
          const doneCount = progress?.session?.results?.length || 0;
          const percent = totalQuestions > 0 ? Math.round((doneCount / totalQuestions) * 100) : 0;
          const statusText = progress?.inProgress
            ? `Đang làm dở: ${doneCount}/${totalQuestions} (${percent}%)`
            : progress?.completed
              ? `Lần gần nhất: ${progress.lastScore || 0}% · ${progress.attempts || 1} lượt`
              : '';

          return (
            <div
              key={t.id}
              className={`topic-card topic-card-${(index % 4) + 1}`}
              onClick={() => onStartTopic(t.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === 'Enter' || event.key === ' ') onStartTopic(t.id);
              }}
            >
              <div className="topic-card-top">
                <div className="topic-icon"><BookOpenText size={21} /></div>
                {isCustom && (
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTopic(t.id);
                    }}
                    title="Xóa"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              {isCustom && <span className="custom-badge">Chủ đề riêng</span>}
              <div className="topic-name">{t.title}</div>
              <div className="topic-meta">
                {(t.sentences?.length || t.sentence_count || 0)} câu · {currentMode === 'drag' ? 'Lắp ghép từ' : 'Tự điền từ'}
              </div>
              <div className="topic-card-footer">
                <div className={`topic-status ${progress?.inProgress ? 'in-progress' : ''}`}>
                  {statusText || 'Sẵn sàng bắt đầu'}
                </div>
                <span className="topic-open"><ArrowUpRight size={17} /></span>
              </div>
            </div>
          );
        })}

        <div
          className="topic-card create-card"
          onClick={onOpenCreate}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') onOpenCreate();
          }}
        >
          <div className="plus"><Plus size={24} /></div>
          <div>
            <div className="create-label">Tạo chủ đề mới</div>
            <div className="create-hint">Thêm bộ câu luyện tập của riêng bạn</div>
          </div>
        </div>
      </div>
    </section>
  );
}
