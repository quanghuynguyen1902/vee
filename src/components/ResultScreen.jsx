export default function ResultScreen({ topic, results, onBack, onRestart }) {
  const correctCount = results.filter((r) => r.correct).length;
  const total = results.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <section className="screen active" id="screen-result">
      <div className="result-header">
        <div className="score-ring">
          <div className="score-number">{score}</div>
          <div className="score-label">Điểm</div>
        </div>
        <div className="eyebrow" style={{ textAlign: 'center' }}>
          Hoàn thành
        </div>
        <h1 className="title" style={{ textAlign: 'center' }}>
          Bạn đã hoàn thành bài học
        </h1>
        <p
          className="subtitle"
          style={{ margin: 'var(--space-2) auto 0', textAlign: 'center' }}
        >
          {topic.title}
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
          Chọn chủ đề khác
        </button>
        <button className="btn btn-primary" onClick={onRestart}>
          Làm lại
        </button>
      </div>
    </section>
  );
}
