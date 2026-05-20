import { useState, useEffect, useRef } from 'react';
import { smartJoin } from '../utils/text';
import ChatPanel from './ChatPanel';

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
  initialProgress,
  onProgress,
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
  const hasRestoredRef = useRef(false);
  const inputRefs = useRef([]);

  const sentence = topic.sentences[currentIndex];
  const isLast = currentIndex + 1 === topic.sentences.length;

  useEffect(() => {
    hasRestoredRef.current = false;
  }, [topic.id, mode]);

  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const saved = initialProgress?.session;
    const canRestore = initialProgress?.inProgress && initialProgress?.lastMode === mode && saved;

    if (canRestore) {
      const total = topic.sentences.length;
      const restoredIndex = Math.min(Math.max(saved.currentIndex || 0, 0), Math.max(total - 1, 0));
      const s = topic.sentences[restoredIndex];
      const restoredAnswers = Array.isArray(saved.userAnswers)
        ? saved.userAnswers.slice(0, s.en.length)
        : new Array(s.en.length).fill('');

      while (restoredAnswers.length < s.en.length) restoredAnswers.push('');

      setCurrentIndex(restoredIndex);
      setResults(Array.isArray(saved.results) ? saved.results : []);
      setChecked(!!saved.checked);
      setFeedback(saved.feedback || '');
      setFeedbackClass(saved.feedbackClass || '');
      setUserAnswers(restoredAnswers);

      if (mode === 'drag') {
        if (Array.isArray(saved.bankWords) && saved.bankWords.length > 0) {
          setBankWords(saved.bankWords);
        } else {
          const pool = shuffle([...s.en]);
          setBankWords(pool.map((word, i) => ({ word, id: i, used: restoredAnswers.includes(word) })));
        }
      } else {
        setBankWords([]);
      }
    } else {
      setCurrentIndex(0);
      setResults([]);
      loadSentence(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, mode]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function pickVoice(langPrefix) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    return (
      voices.find((v) => v.lang?.toLowerCase().startsWith(langPrefix)) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ||
      voices[0]
    );
  }

  function speakText(text, langPrefix) {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(langPrefix);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || (langPrefix === 'vi' ? 'vi-VN' : 'en-US');
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function loadSentence(idx) {
    setChecked(false);
    setFeedback('');
    setFeedbackClass('');
    const s = topic.sentences[idx];
    const empty = new Array(s.en.length).fill('');
    setUserAnswers(empty);

    if (mode === 'drag') {
      const pool = shuffle([...s.en]);
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
        enCorrect: smartJoin(correctArr),
        enUser: smartJoin(userAnswers)
      }
    ]);

    if (allCorrect) {
      setFeedback('Chính xác!');
      setFeedbackClass('correct-text');
    } else {
      setFeedback(`Đáp án đúng: ${smartJoin(correctArr)}`);
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
        enCorrect: smartJoin(correctArr),
        enUser: '(Xem đáp án)'
      }
    ]);

    setFeedback(`Đáp án: ${smartJoin(correctArr)}`);
    setFeedbackClass('wrong-text');
  }

  function nextSentence() {
    if (isLast) {
      onComplete(results);
    } else {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      loadSentence(next);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onProgress?.({
        currentIndex,
        results,
        checked,
        feedback,
        feedbackClass,
        userAnswers,
        bankWords
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [onProgress, currentIndex, results, checked, feedback, feedbackClass, userAnswers, bankWords]);

  return (
    <section className="screen active play-layout" id="screen-play">
      <div className="play-main">
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
        <div className="sentence-audio-actions">
          <button className="btn btn-sm" onClick={() => speakText(sentence.vi, 'vi')}>
            🔊 Nghe câu Việt
          </button>
          <button className="btn btn-sm" onClick={() => speakText(smartJoin(sentence.en), 'en')}>
            🔊 Nghe câu Anh
          </button>
        </div>

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
      </div>

      <ChatPanel contextSentence={sentence} />
    </section>
  );
}
