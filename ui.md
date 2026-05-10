
<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dịch Câu — Luyện dịch tiếng Anh</title>
<style>
  :root {
    --bg:      oklch(97% 0.012 80);
    --surface: oklch(99% 0.005 80);
    --fg:      oklch(20% 0.02 60);
    --muted:   oklch(48% 0.015 60);
    --border:  oklch(89% 0.012 80);
    --accent:  oklch(58% 0.16 35);

    --font-display: 'Iowan Old Style', 'Charter', Georgia, serif;
    --font-body:    -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    --font-mono:    ui-monospace, 'IBM Plex Mono', 'JetBrains Mono', Menlo, monospace;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-12: 3rem;
    --space-16: 4rem;
  }

  * { box-sizing: border-box; margin: 0; }

  html, body {
    height: 100%;
    background: var(--bg);
    color: var(--fg);
    font-family: var(--font-body);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  .app {
    max-width: 720px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: var(--space-6) var(--space-4);
  }

  /* Screen visibility */
  .screen { display: none; }
  .screen.active { display: flex; flex-direction: column; flex: 1; }

  /* Typography */
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--muted);
    margin-bottom: var(--space-2);
  }

  .title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 2.75rem);
    line-height: 1.15;
    font-weight: 600;
    color: var(--fg);
  }

  .subtitle {
    font-size: 1rem;
    color: var(--muted);
    margin-top: var(--space-2);
    max-width: 44ch;
  }

  /* Header */
  .masthead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-8);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--border);
  }

  .logo {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .logo-accent { color: var(--accent); }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6);
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 500;
    border: 1.5px solid var(--border);
    background: var(--surface);
    color: var(--fg);
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    text-decoration: none;
  }

  .btn:hover { border-color: var(--fg); }

  .btn-primary {
    background: var(--fg);
    color: var(--surface);
    border-color: var(--fg);
  }
  .btn-primary:hover {
    background: var(--muted);
    border-color: var(--muted);
  }

  .btn-danger {
    border-color: oklch(75% 0.1 25);
    color: oklch(45% 0.16 25);
  }
  .btn-danger:hover {
    background: oklch(96% 0.04 25);
    border-color: oklch(55% 0.18 25);
  }

  .btn[disabled] {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .btn-sm {
    padding: var(--space-2) var(--space-3);
    font-size: 0.8rem;
  }

  /* Mode toggle */
  .mode-toggle {
    display: inline-flex;
    border: 1.5px solid var(--border);
    margin-top: var(--space-6);
  }

  .mode-btn {
    padding: var(--space-2) var(--space-4);
    background: transparent;
    border: none;
    font-family: var(--font-body);
    font-size: 0.875rem;
    cursor: pointer;
    color: var(--muted);
    transition: background 0.15s, color 0.15s;
  }

  .mode-btn.active {
    background: var(--fg);
    color: var(--surface);
  }

  .mode-btn:not(:last-child) {
    border-right: 1.5px solid var(--border);
  }

  /* Topics screen */
  .topics-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);
    margin-top: var(--space-8);
  }

  @media (min-width: 560px) {
    .topics-grid { grid-template-columns: 1fr 1fr; }
  }

  .topic-card {
    border: 1.5px solid var(--border);
    padding: var(--space-6);
    background: var(--surface);
    cursor: pointer;
    transition: border-color 0.15s;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    position: relative;
  }

  .topic-card:hover { border-color: var(--fg); }

  .topic-card .topic-name {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 600;
  }

  .topic-card .topic-meta {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .topic-card .delete-btn {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    font-size: 1.1rem;
    padding: var(--space-1);
    line-height: 1;
    opacity: 0;
    transition: opacity 0.15s, color 0.15s;
  }
  .topic-card:hover .delete-btn { opacity: 1; }
  .delete-btn:hover { color: oklch(45% 0.16 25); }

  .create-card {
    border: 2px dashed var(--border);
    background: transparent;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 120px;
    gap: var(--space-3);
  }
  .create-card:hover {
    border-color: var(--fg);
    background: var(--surface);
  }
  .create-card .plus {
    font-size: 2rem;
    font-weight: 300;
    color: var(--muted);
    line-height: 1;
  }
  .create-card .create-label {
    font-size: 0.95rem;
    color: var(--muted);
  }

  /* Create topic form */
  .form-group {
    margin-bottom: var(--space-6);
  }

  .form-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: var(--space-2);
    color: var(--fg);
  }

  .form-input, .form-textarea {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    border: 1.5px solid var(--border);
    background: var(--surface);
    color: var(--fg);
    font-family: var(--font-body);
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.15s;
  }
  .form-input:focus, .form-textarea:focus {
    border-color: var(--fg);
  }
  .form-textarea {
    resize: vertical;
    min-height: 60px;
  }

  .sentence-row {
    border: 1.5px solid var(--border);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    background: var(--surface);
  }

  .sentence-row-header {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-bottom: var(--space-3);
  }

  .sentence-row-grid {
    display: grid;
    gap: var(--space-3);
  }

  @media (min-width: 560px) {
    .sentence-row-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .hint-text {
    font-size: 0.8rem;
    color: var(--muted);
    margin-top: var(--space-2);
  }

  .form-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
    margin-top: var(--space-8);
    flex-wrap: wrap;
  }

  /* Play screen */
  .play-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-8);
  }

  .back-link {
    font-size: 0.875rem;
    color: var(--muted);
    text-decoration: none;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font-family: inherit;
  }
  .back-link:hover { color: var(--fg); }

  .progress {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .progress-bar {
    width: 120px;
    height: 3px;
    background: var(--border);
    margin-top: var(--space-1);
    position: relative;
  }

  .progress-bar > span {
    display: block;
    height: 100%;
    background: var(--accent);
    transition: width 0.3s ease;
  }

  .sentence-vi {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 4.5vw, 2.25rem);
    line-height: 1.35;
    text-align: center;
    margin: var(--space-8) 0 var(--space-12);
    color: var(--fg);
  }

  .slots-area {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: center;
    margin-bottom: var(--space-12);
    min-height: 56px;
  }

  /* Drag mode slot */
  .slot {
    min-width: 90px;
    height: 48px;
    border: 1.5px dashed var(--border);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 500;
    color: var(--fg);
    background: transparent;
    cursor: pointer;
    padding: 0 var(--space-3);
    transition: border-color 0.15s, background 0.15s;
  }

  .slot.filled {
    border-style: solid;
    border-color: var(--fg);
    background: var(--surface);
  }

  .slot.correct {
    border-color: oklch(58% 0.14 145);
    color: oklch(42% 0.12 145);
    background: oklch(97% 0.03 145);
  }

  .slot.wrong {
    border-color: oklch(55% 0.18 25);
    color: oklch(45% 0.16 25);
    background: oklch(96% 0.04 25);
  }

  /* Type mode input */
  .slot-input {
    min-width: 90px;
    width: 110px;
    height: 48px;
    border: none;
    border-bottom: 2.5px solid var(--border);
    background: transparent;
    text-align: center;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 500;
    color: var(--fg);
    outline: none;
    padding: 0 var(--space-2);
    transition: border-color 0.15s, background 0.15s;
  }

  .slot-input:focus {
    border-bottom-color: var(--fg);
  }

  .slot-input.correct {
    border-bottom-color: oklch(58% 0.14 145);
    color: oklch(42% 0.12 145);
    background: oklch(97% 0.03 145);
  }

  .slot-input.wrong {
    border-bottom-color: oklch(55% 0.18 25);
    color: oklch(45% 0.16 25);
    background: oklch(96% 0.04 25);
  }

  .bank-label {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--muted);
    text-align: center;
    margin-bottom: var(--space-4);
  }

  .word-bank {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: center;
    margin-bottom: var(--space-8);
  }

  .word-chip {
    padding: var(--space-2) var(--space-4);
    border: 1.5px solid var(--border);
    background: var(--surface);
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--fg);
    cursor: pointer;
    transition: border-color 0.15s, transform 0.1s, opacity 0.15s;
    user-select: none;
  }

  .word-chip:hover { border-color: var(--fg); }
  .word-chip:active { transform: translateY(1px); }
  .word-chip.used {
    opacity: 0.25;
    pointer-events: none;
  }

  .play-actions {
    margin-top: auto;
    display: flex;
    justify-content: center;
    padding-top: var(--space-8);
  }

  .feedback {
    text-align: center;
    margin-bottom: var(--space-4);
    font-size: 0.95rem;
    min-height: 1.6em;
  }

  .feedback.correct-text { color: oklch(42% 0.12 145); }
  .feedback.wrong-text { color: oklch(45% 0.16 25); }

  /* Result screen */
  .result-header {
    text-align: center;
    margin: var(--space-8) 0 var(--space-12);
  }

  .score-ring {
    width: 140px;
    height: 140px;
    border: 3px solid var(--border);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--space-6);
  }

  .score-number {
    font-family: var(--font-display);
    font-size: 2.5rem;
    font-weight: 600;
    line-height: 1;
  }

  .score-label {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-top: var(--space-1);
  }

  .result-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-bottom: var(--space-8);
  }

  .result-item {
    border: 1.5px solid var(--border);
    padding: var(--space-4);
    background: var(--surface);
  }

  .result-item .vi {
    font-family: var(--font-display);
    font-size: 1.05rem;
    margin-bottom: var(--space-2);
  }

  .result-item .en {
    font-size: 0.95rem;
    color: var(--muted);
  }

  .result-item .en .your { text-decoration: line-through; margin-right: var(--space-2); }
  .result-item .en .correct-ans { color: oklch(42% 0.12 145); font-weight: 500; }

  .result-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
    flex-wrap: wrap;
  }

  .spacer { flex: 1; }

  .hint {
    text-align: center;
    font-size: 0.8rem;
    color: var(--muted);
    margin-bottom: var(--space-4);
  }

  .custom-badge {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 2px 6px;
    border: 1px solid var(--border);
    color: var(--muted);
    margin-bottom: var(--space-2);
  }
</style>
</head>
<body>

<div class="app">

  <!-- Masthead -->
  <header class="masthead">
    <div class="logo">Dịch<span class="logo-accent">.</span>Câu</div>
    <div class="eyebrow" style="margin:0;">Luyện dịch tiếng Anh</div>
  </header>

  <!-- Screen 1: Topics -->
  <section class="screen active" id="screen-topics" data-screen-label="Chủ đề">
    <div>
      <div class="eyebrow">Chọn bài học</div>
      <h1 class="title">Bạn muốn luyện chủ đề nào?</h1>
      <p class="subtitle" id="topics-subtitle">Sắp xếp từ tiếng Anh để dịch đúng nghĩa câu tiếng Việt.</p>

      <div class="mode-toggle">
        <button class="mode-btn active" data-mode="drag" onclick="setMode('drag')">Lắp ghép từ</button>
        <button class="mode-btn" data-mode="type" onclick="setMode('type')">Tự điền từ</button>
      </div>
    </div>
    <div class="topics-grid" id="topics-grid"></div>
  </section>

  <!-- Screen 1b: Create Topic -->
  <section class="screen" id="screen-create-topic" data-screen-label="Tạo chủ đề">
    <div class="play-header" style="margin-bottom: var(--space-6);">
      <button class="back-link" onclick="goTopics()">← Quay lại</button>
    </div>

    <div class="eyebrow">Tạo mới</div>
    <h1 class="title" style="margin-bottom: var(--space-2);">Tạo chủ đề của bạn</h1>
    <p class="subtitle" style="margin-bottom: var(--space-8);">Nhập 5 câu tiếng Việt và các từ tiếng Anh tương ứng. App sẽ tạo bài tập từ dữ liệu này.</p>

    <div class="form-group">
      <label class="form-label" for="ct-name">Tên chủ đề</label>
      <input class="form-input" id="ct-name" type="text" placeholder="Ví dụ: Công nghệ, Thể thao, Âm nhạc...">
    </div>

    <div id="sentence-rows">
      <!-- Rows generated by JS -->
    </div>

    <div class="hint-text">Mỗi dòng: câu tiếng Việt ở ô trái, các từ tiếng Anh (cách nhau bằng dấu cách) ở ô phải.</div>

    <div class="form-actions">
      <button class="btn" onclick="goTopics()">Hủy</button>
      <button class="btn btn-primary" onclick="saveCustomTopic()">Lưu chủ đề</button>
    </div>
  </section>

  <!-- Screen 2: Play -->
  <section class="screen" id="screen-play" data-screen-label="Luyện dịch">
    <div class="play-header">
      <button class="back-link" onclick="goTopics()">← Quay lại</button>
      <div>
        <div class="progress" id="progress-text">1 / 5</div>
        <div class="progress-bar"><span id="progress-fill" style="width:20%"></span></div>
      </div>
    </div>

    <div class="spacer"></div>

    <div class="sentence-vi" id="sentence-vi"></div>

    <div class="slots-area" id="slots-area"></div>

    <div class="bank-label" id="bank-label">Chọn từ để sắp xếp</div>
    <div class="word-bank" id="word-bank"></div>

    <div class="hint" id="type-hint" style="display:none;">Nhập từng từ vào ô trống, dùng Tab để chuyển ô.</div>

    <div class="feedback" id="feedback"></div>

    <div class="play-actions">
      <button class="btn btn-primary" id="check-btn" onclick="checkAnswer()">Kiểm tra</button>
      <button class="btn" id="next-btn" onclick="nextSentence()" style="display:none;">Câu tiếp theo →</button>
    </div>
  </section>

  <!-- Screen 3: Result -->
  <section class="screen" id="screen-result" data-screen-label="Kết quả">
    <div class="result-header">
      <div class="score-ring">
        <div class="score-number" id="score-number">0</div>
        <div class="score-label">Điểm</div>
      </div>
      <div class="eyebrow" style="text-align:center;">Hoàn thành</div>
      <h1 class="title" style="text-align:center;">Bạn đã hoàn thành bài học</h1>
      <p class="subtitle" style="margin:var(--space-2) auto 0; text-align:center;" id="result-topic-name">Chủ đề</p>
    </div>

    <div class="result-list" id="result-list"></div>

    <div class="result-actions">
      <button class="btn" onclick="goTopics()">Chọn chủ đề khác</button>
      <button class="btn btn-primary" onclick="restartTopic()">Làm lại</button>
    </div>
  </section>

</div>

<script>
  // Built-in topics
  const builtInTopics = [
    {
      id: 'greetings',
      title: 'Chào hỏi cơ bản',
      sentences: [
        { vi: 'Xin chào, bạn khỏe không?', en: ['Hello', 'how', 'are', 'you'] },
        { vi: 'Tôi tên là Minh.', en: ['My', 'name', 'is', 'Minh'] },
        { vi: 'Rất vui được gặp bạn.', en: ['Nice', 'to', 'meet', 'you'] },
        { vi: 'Hẹn gặp lại.', en: ['See', 'you', 'later'] },
        { vi: 'Cảm ơn rất nhiều.', en: ['Thank', 'you', 'very', 'much'] }
      ]
    },
    {
      id: 'family',
      title: 'Gia đình',
      sentences: [
        { vi: 'Đây là mẹ của tôi.', en: ['This', 'is', 'my', 'mother'] },
        { vi: 'Bố tôi là bác sĩ.', en: ['My', 'father', 'is', 'a', 'doctor'] },
        { vi: 'Tôi có một chị gái.', en: ['I', 'have', 'an', 'older', 'sister'] },
        { vi: 'Gia đình tôi có năm người.', en: ['My', 'family', 'has', 'five', 'people'] },
        { vi: 'Con chó của tôi rất đáng yêu.', en: ['My', 'dog', 'is', 'very', 'cute'] }
      ]
    },
    {
      id: 'food',
      title: 'Ăn uống',
      sentences: [
        { vi: 'Tôi muốn một tô phở.', en: ['I', 'want', 'a', 'bowl', 'of', 'pho'] },
        { vi: 'Bạn có thích cà phê không?', en: ['Do', 'you', 'like', 'coffee'] },
        { vi: 'Món này rất ngon.', en: ['This', 'dish', 'is', 'very', 'delicious'] },
        { vi: 'Tôi đang đói bụng.', en: ['I', 'am', 'hungry'] },
        { vi: 'Hóa đơn là bao nhiêu?', en: ['How', 'much', 'is', 'the', 'bill'] }
      ]
    },
    {
      id: 'travel',
      title: 'Du lịch',
      sentences: [
        { vi: 'Tôi muốn đặt một phòng.', en: ['I', 'want', 'to', 'book', 'a', 'room'] },
        { vi: 'Nhà vệ sinh ở đâu?', en: ['Where', 'is', 'the', 'bathroom'] },
        { vi: 'Ga tàu ở gần đây không?', en: ['Is', 'the', 'train', 'station', 'nearby'] },
        { vi: 'Tôi đi lạc đường rồi.', en: ['I', 'am', 'lost'] },
        { vi: 'Cảnh ở đây thật đẹp.', en: ['The', 'scenery', 'here', 'is', 'beautiful'] }
      ]
    },
    {
      id: 'work',
      title: 'Công việc',
      sentences: [
        { vi: 'Tôi làm việc tại công ty này.', en: ['I', 'work', 'at', 'this', 'company'] },
        { vi: 'Cuộc họp bắt đầu lúc 9 giờ.', en: ['The', 'meeting', 'starts', 'at', 'nine'] },
        { vi: 'Tôi gửi email cho bạn rồi.', en: ['I', 'sent', 'you', 'an', 'email'] },
        { vi: 'Hạn chót là ngày mai.', en: ['The', 'deadline', 'is', 'tomorrow'] },
        { vi: 'Chúng ta cần làm việc nhóm.', en: ['We', 'need', 'to', 'work', 'as', 'a', 'team'] }
      ]
    }
  ];

  // State
  let currentMode = 'drag';
  let currentTopic = null;
  let currentSentenceIndex = 0;
  let userAnswers = [];
  let results = [];
  let checked = false;
  let bankWords = [];

  // localStorage keys
  const LS_KEY = 'dichcau_custom_topics';

  function getCustomTopics() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomTopics(list) {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  }

  function getAllTopics() {
    const custom = getCustomTopics();
    return [...builtInTopics, ...custom];
  }

  // Utility
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
  }

  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    const sub = document.getElementById('topics-subtitle');
    if (mode === 'drag') {
      sub.textContent = 'Sắp xếp từ tiếng Anh để dịch đúng nghĩa câu tiếng Việt.';
    } else {
      sub.textContent = 'Nhập từng từ tiếng Anh để dịch đúng nghĩa câu tiếng Việt.';
    }
    renderTopics();
  }

  // Screen 1: Render topics
  function renderTopics() {
    const grid = document.getElementById('topics-grid');
    const all = getAllTopics();

    let html = all.map(t => {
      const isCustom = !builtInTopics.some(b => b.id === t.id);
      return `
        <div class="topic-card" onclick="startTopic('${t.id}')">
          ${isCustom ? '<span class="custom-badge">Tự tạo</span>' : ''}
          <div class="topic-name">${escapeHtml(t.title)}</div>
          <div class="topic-meta">${t.sentences.length} câu · ${currentMode === 'drag' ? 'Lắp ghép từ' : 'Tự điền từ'}</div>
          ${isCustom ? `<button class="delete-btn" onclick="event.stopPropagation(); deleteCustomTopic('${t.id}')" title="Xóa">×</button>` : ''}
        </div>
      `;
    }).join('');

    html += `
      <div class="topic-card create-card" onclick="openCreateTopic()">
        <div class="plus">+</div>
        <div class="create-label">Tạo chủ đề mới</div>
      </div>
    `;

    grid.innerHTML = html;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));
  }

  function startTopic(id) {
    const all = getAllTopics();
    currentTopic = all.find(t => t.id === id);
    if (!currentTopic) return;
    currentSentenceIndex = 0;
    results = [];
    loadSentence();
    showScreen('screen-play');
  }

  function goTopics() {
    renderTopics();
    showScreen('screen-topics');
  }

  // ---- Create Topic ----
  function openCreateTopic() {
    document.getElementById('ct-name').value = '';
    const container = document.getElementById('sentence-rows');
    container.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      container.innerHTML += `
        <div class="sentence-row">
          <div class="sentence-row-header">Câu ${i}</div>
          <div class="sentence-row-grid">
            <div>
              <label class="form-label">Tiếng Việt</label>
              <input class="form-input ct-vi" type="text" placeholder="Nhập câu tiếng Việt..." data-idx="${i}">
            </div>
            <div>
              <label class="form-label">Từ tiếng Anh <span style="font-weight:400;color:var(--muted);">(cách nhau bằng dấu cách)</span></label>
              <input class="form-input ct-en" type="text" placeholder="VD: Hello how are you" data-idx="${i}">
            </div>
          </div>
        </div>
      `;
    }
    showScreen('screen-create-topic');
  }

  function saveCustomTopic() {
    const name = document.getElementById('ct-name').value.trim();
    if (!name) {
      alert('Vui lòng nhập tên chủ đề.');
      return;
    }

    const viInputs = document.querySelectorAll('.ct-vi');
    const enInputs = document.querySelectorAll('.ct-en');
    const sentences = [];

    for (let i = 0; i < 5; i++) {
      const vi = viInputs[i].value.trim();
      const enRaw = enInputs[i].value.trim();
      if (!vi || !enRaw) {
        alert(`Vui lòng điền đầy đủ câu ${i + 1}.`);
        return;
      }
      const en = enRaw.split(/\s+/).filter(Boolean);
      if (en.length === 0) {
        alert(`Câu ${i + 1} cần có ít nhất một từ tiếng Anh.`);
        return;
      }
      sentences.push({ vi, en });
    }

    const custom = getCustomTopics();
    const newTopic = {
      id: 'custom_' + Date.now(),
      title: name,
      sentences
    };
    custom.push(newTopic);
    saveCustomTopics(custom);

    goTopics();
  }

  function deleteCustomTopic(id) {
    if (!confirm('Xóa chủ đề này?')) return;
    let custom = getCustomTopics();
    custom = custom.filter(t => t.id !== id);
    saveCustomTopics(custom);
    renderTopics();
  }

  // Screen 2: Play
  function loadSentence() {
    checked = false;
    const s = currentTopic.sentences[currentSentenceIndex];
    document.getElementById('sentence-vi').textContent = s.vi;
    document.getElementById('progress-text').textContent = `${currentSentenceIndex + 1} / ${currentTopic.sentences.length}`;
    document.getElementById('progress-fill').style.width = `${((currentSentenceIndex + 1) / currentTopic.sentences.length) * 100}%`;

    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('check-btn').style.display = 'inline-flex';
    document.getElementById('check-btn').disabled = true;
    document.getElementById('next-btn').style.display = 'none';

    if (currentMode === 'drag') {
      loadDragMode(s);
    } else {
      loadTypeMode(s);
    }
  }

  // ----- Drag mode -----
  function loadDragMode(s) {
    document.getElementById('bank-label').style.display = 'block';
    document.getElementById('word-bank').style.display = 'flex';
    document.getElementById('type-hint').style.display = 'none';

    const slotsArea = document.getElementById('slots-area');
    slotsArea.innerHTML = '';
    userAnswers = new Array(s.en.length).fill('');

    for (let i = 0; i < s.en.length; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.index = i;
      slot.onclick = () => onSlotClick(i);
      slotsArea.appendChild(slot);
    }

    // Distractors for built-in topics
    const builtInDistractors = {
      greetings: ['good', 'morning', 'fine'],
      family: ['brother', 'her', 'his'],
      food: ['water', 'eat', 'rice'],
      travel: ['map', 'hotel', 'ticket'],
      work: ['job', 'boss', 'office']
    };

    let extra = [];
    const isBuiltIn = builtInTopics.some(b => b.id === currentTopic.id);
    if (isBuiltIn) {
      extra = builtInDistractors[currentTopic.id] || [];
    } else {
      // For custom topics, use a generic set of common English words as distractors
      extra = shuffle(['the', 'and', 'with', 'from', 'about', 'before', 'after', 'they', 'them', 'their', 'would', 'could', 'should']);
      extra = extra.slice(0, 3);
    }

    const pool = shuffle([...s.en, ...extra]);
    bankWords = pool;

    const bank = document.getElementById('word-bank');
    bank.innerHTML = '';
    pool.forEach((word, idx) => {
      const chip = document.createElement('div');
      chip.className = 'word-chip';
      chip.textContent = word;
      chip.dataset.word = word;
      chip.dataset.bankIdx = idx;
      chip.onclick = () => onBankClick(word, chip);
      bank.appendChild(chip);
    });
  }

  function onBankClick(word, chipEl) {
    if (checked) return;
    const emptyIdx = userAnswers.findIndex(a => a === '');
    if (emptyIdx === -1) return;

    userAnswers[emptyIdx] = word;
    chipEl.classList.add('used');
    renderDragSlots();
    updateCheckButton();
  }

  function onSlotClick(idx) {
    if (checked) return;
    const word = userAnswers[idx];
    if (!word) return;

    const chip = document.querySelector(`.word-chip[data-word="${CSS.escape(word)}"]`);
    if (chip) chip.classList.remove('used');

    userAnswers[idx] = '';
    renderDragSlots();
    updateCheckButton();
  }

  function renderDragSlots() {
    const slots = document.querySelectorAll('.slot');
    slots.forEach((slot, i) => {
      slot.textContent = userAnswers[i];
      slot.classList.toggle('filled', userAnswers[i] !== '');
      slot.classList.remove('correct', 'wrong');
    });
  }

  // ----- Type mode -----
  function loadTypeMode(s) {
    document.getElementById('bank-label').style.display = 'none';
    document.getElementById('word-bank').style.display = 'none';
    document.getElementById('type-hint').style.display = 'block';

    const slotsArea = document.getElementById('slots-area');
    slotsArea.innerHTML = '';
    userAnswers = new Array(s.en.length).fill('');

    for (let i = 0; i < s.en.length; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'slot-input';
      input.autocomplete = 'off';
      input.autocapitalize = 'off';
      input.spellcheck = false;
      input.dataset.index = i;
      input.placeholder = '';
      input.addEventListener('input', () => {
        userAnswers[i] = input.value.trim();
        updateCheckButton();
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (!document.getElementById('check-btn').disabled) {
            checkAnswer();
          }
        }
        if (e.key === 'Tab') {
          // Let default tab behavior happen
        }
      });
      slotsArea.appendChild(input);
    }
  }

  function updateCheckButton() {
    const allFilled = userAnswers.every(a => a && a !== '');
    document.getElementById('check-btn').disabled = !allFilled;
  }

  function checkAnswer() {
    if (checked) return;
    checked = true;
    const s = currentTopic.sentences[currentSentenceIndex];
    const correctArr = s.en;
    let allCorrect = true;

    if (currentMode === 'drag') {
      const slots = document.querySelectorAll('.slot');
      slots.forEach((slot, i) => {
        const userWord = userAnswers[i];
        const isCorrect = userWord.toLowerCase() === correctArr[i].toLowerCase();
        slot.classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) allCorrect = false;
      });
    } else {
      const inputs = document.querySelectorAll('.slot-input');
      inputs.forEach((input, i) => {
        const userWord = input.value.trim();
        const isCorrect = userWord.toLowerCase() === correctArr[i].toLowerCase();
        input.classList.add(isCorrect ? 'correct' : 'wrong');
        input.readOnly = true;
        if (!isCorrect) allCorrect = false;
      });
    }

    results.push({
      correct: allCorrect,
      vi: s.vi,
      enCorrect: correctArr.join(' '),
      enUser: userAnswers.join(' ')
    });

    const fb = document.getElementById('feedback');
    if (allCorrect) {
      fb.textContent = 'Chính xác!';
      fb.className = 'feedback correct-text';
    } else {
      fb.textContent = `Đáp án đúng: ${correctArr.join(' ')}`;
      fb.className = 'feedback wrong-text';
    }

    document.getElementById('check-btn').style.display = 'none';
    const nextBtn = document.getElementById('next-btn');
    nextBtn.style.display = 'inline-flex';
    nextBtn.textContent = currentSentenceIndex + 1 === currentTopic.sentences.length ? 'Xem kết quả →' : 'Câu tiếp theo →';
  }

  function nextSentence() {
    if (currentSentenceIndex + 1 < currentTopic.sentences.length) {
      currentSentenceIndex++;
      loadSentence();
    } else {
      showResult();
    }
  }

  // Screen 3: Result
  function showResult() {
    const correctCount = results.filter(r => r.correct).length;
    const total = currentTopic.sentences.length;
    const score = Math.round((correctCount / total) * 100);

    document.getElementById('score-number').textContent = score;
    document.getElementById('result-topic-name').textContent = currentTopic.title;

    const list = document.getElementById('result-list');
    list.innerHTML = results.map((r, i) => `
      <div class="result-item">
        <div class="vi">${i + 1}. ${r.vi}</div>
        <div class="en">
          ${r.correct
            ? `<span class="correct-ans">${r.enCorrect}</span>`
            : `<span class="your">${r.enUser}</span><span class="correct-ans">${r.enCorrect}</span>`}
        </div>
      </div>
    `).join('');

    showScreen('screen-result');
  }

  function restartTopic() {
    currentSentenceIndex = 0;
    results = [];
    loadSentence();
    showScreen('screen-play');
  }

  // Init
  renderTopics();
</script>

</body>
</html>
