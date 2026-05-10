import { useState, useEffect, useRef } from 'react';

const builtInDistractors = {
  greetings: ['good', 'morning', 'fine'],
  family: ['brother', 'her', 'his'],
  food: ['water', 'eat', 'rice'],
  travel: ['map', 'hotel', 'ticket'],
  work: ['job', 'boss', 'office']
};

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PlayScreen({
  topic,
  mode,
  onBack,
  onComplete
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [bankWords, setBankWords] = useState([]);
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackClass, setFeedbackClass] = useState('');
  const [results, setResults] = useState([]);
  const inputRefs = useRef([]);

  const sentence = topic.sentences[currentIndex];
  const isLast = currentIndex + 1 === topic.sentences.length;

  useEffect(() => {
    setCurrentIndex(0);
    setResults([]);
    loadSentence(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, mode]);

  function loadSentence(idx) {
    setChecked(false);
    setFeedback('');
    setFeedbackClass('');
    const s = topic.sentences[idx];
    const empty = new Array(s.en.length).fill('');
    setUserAnswers(empty);

    if (mode === 'drag') {
      const isBuiltIn = !!builtInDistractors[topic.id];
      let extra = [];
      if (isBuiltIn) {
        extra = builtInDistractors[topic.id] || [];
      } else {
        extra = shuffle(['the', 'and', 'with', 'from', 'about', 'before', 'after', 'they', 'them', 'their', 'would', 'could', 'should']).slice(0, 3);
      }
      const pool = shuffle([...s.en, ...extra]);
      setBankWords(pool.map((word, i) => ({ word, id: i, used: false })));
    } else {
      setBankWords([]);
    }
  }

  function onBankClick(word, bankIdx) {
    if (checked) return;
    const emptyIdx = userAnswers.findIndex((a) => a === '');
    if (emptyIdx === -1) return;

    const newAnswers = [...userAnswers];
    newAnswers[emptyIdx] = word;
    setUserAnswers(newAnswers);

    setBankWords((prev) =>
      prev.map((b) => (b.id === bankIdx ? { ...b, used: true } : b))
    );
  }

  function onSlotClick(slotIdx) {
    if (checked) return;
    const word = userAnswers[slotIdx];
    if (!word) return;

    setBankWords((prev) =>
      prev.map((b) => (b.word === word && b.used ? { ...b, used: false } : b))
    );

    const newAnswers = [...userAnswers];
    newAnswers[slotIdx] = '';
    setUserAnswers(newAnswers);
  }

  function onTypeInput(slotIdx, value) {
    if (checked) return;
    const newAnswers = [...userAnswers];
    newAnswers[slotIdx] = value.trim();
    setUserAnswers(newAnswers);
  }

  const allFilled = userAnswers.every((a) => a && a !== '');

  function checkAnswer() {
    if (checked) return;
    setChecked(true);
    const correctArr = sentence.en;
    let allCorrect = true;

    if (mode === 'drag') {
      for (let i = 0; i < correctArr.length; i++) {
        if (userAnswers[i].toLowerCase() !== correctArr[i].toLowerCase()) {
          allCorrect = false;
          break;
        }
      }
    } else {
      for (let i = 0; i < correctArr.length; i++) {
        if (userAnswers[i].toLowerCase() !== correctArr[i].toLowerCase()) {
          allCorrect = false;
          break;
        }
      }
    }

    setResults((prev) => [
      ...prev,
      {
        correct: allCorrect,
        vi: sentence.vi,
        enCorrect: correctArr.join(' '),
        enUser: userAnswers.join(' ')
      }
    ]);

    if (allCorrect) {
      setFeedback('Chính xác!');
      setFeedbackClass('correct-text');
    } else {
      setFeedback(`Đáp án đúng: ${correctArr.join(' ')}`);
      setFeedbackClass('wrong-text');
    }
  }

  function showAnswer() {
    if (checked) return;
    setChecked(true);
    const correctArr = sentence.en;

    // Fill correct answers into slots
    setUserAnswers(correctArr.slice());

    // Mark all bank words as used in drag mode
    if (mode === 'drag') {
      setBankWords((prev) =>
        prev.map((b) => ({ ...b, used: true }))
      );
    }

    setResults((prev) => [
      ...prev,
      {
        correct: false,
        vi: sentence.vi,
        enCorrect: correctArr.join(' '),
        enUser: '(Xem đáp án)'
      }
    ]);

    setFeedback(`Đáp án: ${correctArr.join(' ')}`);
    setFeedbackClass('wrong-text');
  }

  function nextSentence() {
    if (isLast) {
      onComplete([...results, {
        correct: feedbackClass === 'correct-text',
        vi: sentence.vi,
        enCorrect: sentence.en.join(' '),
        enUser: userAnswers.join(' ')
      }]);
    } else {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      loadSentence(next);
    }
  }

  // Re-calc results for final when clicking next on last
  useEffect(() => {
    if (isLast && checked && results.length === topic.sentences.length - 1) {
      // pending final result will be added in nextSentence
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, currentIndex]);

  return (
    <section className="screen active" id="screen-play">
      <div className="play-header">
        <button className="back-link" onClick={onBack}>
          ← Quay lại
        </button>
        <div>
          <div className="progress">
            {currentIndex + 1} / {topic.sentences.length}
          </div>
          <div className="progress-bar">
            <span
              style={{
                width: `${((currentIndex + 1) / topic.sentences.length) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      <div className="spacer" />

      <div className="sentence-vi">{sentence.vi}</div>

      <div className="slots-area">
        {mode === 'drag'
          ? userAnswers.map((ans, i) => (
              <div
                key={i}
                className={`slot ${ans ? 'filled' : ''} ${
                  checked
                    ? ans.toLowerCase() === sentence.en[i].toLowerCase()
                      ? 'correct'
                      : 'wrong'
                    : ''
                }`}
                onClick={() => onSlotClick(i)}
              >
                {ans}
              </div>
            ))
          : userAnswers.map((ans, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                className={`slot-input ${
                  checked
                    ? ans.toLowerCase() === sentence.en[i].toLowerCase()
                      ? 'correct'
                      : 'wrong'
                    : ''
                }`}
                value={ans}
                onChange={(e) => onTypeInput(i, e.target.value)}
                readOnly={checked}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (allFilled) checkAnswer();
                  }
                }}
              />
            ))}
      </div>

      {mode === 'drag' && (
        <>
          <div className="bank-label">Chọn từ để sắp xếp</div>
          <div className="word-bank">
            {bankWords.map((b) => (
              <div
                key={b.id}
                className={`word-chip ${b.used ? 'used' : ''}`}
                onClick={() => onBankClick(b.word, b.id)}
              >
                {b.word}
              </div>
            ))}
          </div>
        </>
      )}

      {mode === 'type' && (
        <div className="hint" id="type-hint">
          Nhập từng từ vào ô trống, dùng Tab để chuyển ô.
        </div>
      )}

      <div className={`feedback ${feedbackClass}`}>{feedback}</div>

      <div className="play-actions" style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {!checked ? (
          <>
            <button
              className="btn btn-primary"
              disabled={!allFilled}
              onClick={checkAnswer}
            >
              Kiểm tra
            </button>
            <button
              className="btn"
              onClick={showAnswer}
            >
              Xem đáp án
            </button>
          </>
        ) : (
          <button className="btn" onClick={nextSentence}>
            {isLast ? 'Xem kết quả →' : 'Câu tiếp theo →'}
          </button>
        )}
      </div>
    </section>
  );
}
