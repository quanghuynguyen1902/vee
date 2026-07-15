import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, AudioLines, Check, Ear, Eye, Gauge, Volume2 } from 'lucide-react';
import { smartJoin } from '../utils/text';
import { buildSpeechSettings, choosePreferredVoice } from '../utils/tts';
import ChatPanel from './ChatPanel';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getTypeSlotStyle(word = '') {
  const charCount = Math.max(word.length, 1);
  return {
    width: `calc(${charCount}ch + var(--space-4))`,
    minWidth: `calc(${charCount}ch + var(--space-4))`
  };
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
  const [voicesReady, setVoicesReady] = useState(false);
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
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;

    const synth = window.speechSynthesis;
    const syncVoices = () => {
      setVoicesReady(synth.getVoices().length > 0);
    };

    syncVoices();
    synth.addEventListener?.('voiceschanged', syncVoices);
    return () => synth.removeEventListener?.('voiceschanged', syncVoices);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function pickVoice(lang) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    return choosePreferredVoice(voices, lang);
  }

  function speakText(text, { lang = 'en-US', slow = false } = {}) {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(lang);
    const settings = buildSpeechSettings({ lang: voice?.lang || lang, slow });
    if (voice) utterance.voice = voice;
    utterance.lang = settings.lang;
    utterance.rate = settings.rate;
    synth.speak(utterance);
  }

  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

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
            <ArrowLeft size={17} /> Quay lại
          </button>
          <div className="play-topic-label">{topic.title}</div>
          <div className="progress-wrap">
            <div className="progress">
              Câu {currentIndex + 1} / {topic.sentences.length}
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

        <div className="practice-prompt">
          <div className="practice-kicker">Dịch câu này sang tiếng Anh</div>
          <div className="sentence-vi">{sentence.vi}</div>
        </div>
        <div className="sentence-audio-actions">
          <button
            className="btn btn-sm"
            disabled={!speechSupported || !voicesReady}
            onClick={() => speakText(sentence.vi, { lang: 'vi-VN' })}
          >
            <Volume2 size={15} /> Câu Việt
          </button>
          <button
            className="btn btn-sm"
            disabled={!speechSupported || !voicesReady}
            onClick={() => speakText(smartJoin(sentence.en), { lang: 'en-US' })}
          >
            <Ear size={15} /> Anh Mỹ
          </button>
          <button
            className="btn btn-sm"
            disabled={!speechSupported || !voicesReady}
            onClick={() => speakText(smartJoin(sentence.en), { lang: 'en-GB' })}
          >
            <AudioLines size={15} /> Anh Anh
          </button>
          <button
            className="btn btn-sm"
            disabled={!speechSupported || !voicesReady}
            onClick={() => speakText(smartJoin(sentence.en), { lang: 'en-US', slow: true })}
          >
            <Gauge size={15} /> Nghe chậm
          </button>
        </div>
        {speechSupported && !voicesReady && (
          <div className="hint">Đang tải giọng đọc trên trình duyệt...</div>
        )}

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
            : userAnswers.map((ans, i) => {
                const targetWord = sentence.en[i] || '';
                const statusClass = checked
                  ? ans.toLowerCase() === targetWord.toLowerCase()
                    ? 'correct'
                    : 'wrong'
                  : '';
                return checked ? (
                  <div
                    key={i}
                    className={`slot-input ${statusClass}`}
                    style={getTypeSlotStyle(targetWord)}
                  >
                    {ans}
                  </div>
                ) : (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    className={`slot-input ${statusClass}`}
                    value={ans}
                    style={getTypeSlotStyle(targetWord)}
                    placeholder={'-'.repeat(targetWord.length)}
                    onChange={(e) => onTypeInput(i, e.target.value)}
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
                );
              })}
        </div>

        {mode === 'drag' && !checked && (
          <div className="word-bank-section">
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
          </div>
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
                <Check size={17} /> Kiểm tra
              </button>
              <button
                className="btn"
                onClick={showAnswer}
              >
                <Eye size={17} /> Xem đáp án
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
