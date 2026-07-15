import { LayoutGrid, RotateCcw, Trophy } from 'lucide-react';

export default function ResultScreen({ topic, results, onBack, onRestart }) {
  const correctCount = results.filter((r) => r.correct).length;
  const total = results.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <section className="screen active" id="screen-result">
      <div className="result-header">
        <div className="score-ring">
          <Trophy size={24} />
          <div className="score-number">{score}</div>
          <div className="score-label">Điểm số</div>
        </div>
        <div className="eyebrow result-eyebrow">
          Hoàn thành xuất sắc
        </div>
        <h1 className="title">
          Thêm một bước tiến mới!
        </h1>
        <p className="subtitle">
          Bạn đã hoàn thành chủ đề <strong>{topic.title}</strong> với {correctCount}/{total} câu chính xác.
        </p>
      </div>

      <div className="result-list">
        {results.map((r, i) => (
          <div className="result-item" key={i}>
            <div className="vi">
              {i + 1}. {r.vi}
            </div>
            <div className="en">
              {r.correct ? (
                <span className="correct-ans">{r.enCorrect}</span>
              ) : (
                <>
                  <span className="your">{r.enUser}</span>
                  <span className="correct-ans">{r.enCorrect}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="result-actions">
        <button className="btn" onClick={onBack}>
          <LayoutGrid size={17} /> Chủ đề khác
        </button>
        <button className="btn btn-primary" onClick={onRestart}>
          <RotateCcw size={17} /> Luyện lại
        </button>
      </div>
    </section>
  );
}
