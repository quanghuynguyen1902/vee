import { useState, useCallback, useMemo, useEffect } from 'react';
import './index.css';
import { getCustomTopics, saveCustomTopic, deleteCustomTopic, getTopic } from './utils/storage';
import { generateFromMeetings } from './utils/ai';
import {
  loadTopicProgress,
  saveTopicProgress,
  markTopicStarted,
  markTopicCompleted,
  updateTopicSession,
  clearTopicProgress
} from './utils/progress';
import TopicsScreen from './components/TopicsScreen';
import CreateTopicScreen from './components/CreateTopicScreen';
import PlayScreen from './components/PlayScreen';
import ResultScreen from './components/ResultScreen';
import ImportModal from './components/ImportModal';
import AiGenerateModal from './components/AiGenerateModal';
import DBViewer from './components/DBViewer';
import ToastContainer, { useToast } from './components/Toast';

const SCREENS = {
  TOPICS: 'topics',
  CREATE: 'create',
  PLAY: 'play',
  RESULT: 'result'
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.TOPICS);
  const [currentMode, setCurrentMode] = useState('drag');
  const [currentTopic, setCurrentTopic] = useState(null);
  const [results, setResults] = useState([]);
  const [customTopics, setCustomTopics] = useState([]);
  const [topicProgress, setTopicProgress] = useState(() => loadTopicProgress());
  const [showImport, setShowImport] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [showDBViewer, setShowDBViewer] = useState(false);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  // Load custom topics from backend on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const topics = await getCustomTopics();
        if (!cancelled) setCustomTopics(topics);
      } catch (err) {
        console.error('Failed to load topics:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    saveTopicProgress(topicProgress);
  }, [topicProgress]);

  const allTopics = useMemo(() => {
    return customTopics.map((t) => ({ ...t, isBuiltIn: false }));
  }, [customTopics]);

  const goTopics = useCallback(() => {
    setScreen(SCREENS.TOPICS);
    setCurrentTopic(null);
    setResults([]);
  }, []);

  const startTopic = useCallback(
    async (id) => {
      const topic = allTopics.find((t) => t.id === id);
      if (!topic) return;

      // If custom topic, fetch full sentences from backend
      let fullTopic = topic;
      if (!topic.isBuiltIn) {
        try {
          const detail = await getTopic(id);
          if (detail) fullTopic = detail;
        } catch (err) {
          console.warn('Could not fetch topic detail:', err);
        }
      }

      setCurrentTopic(fullTopic);
      setResults([]);
      setScreen(SCREENS.PLAY);
      setTopicProgress((prev) =>
        markTopicStarted(
          prev,
          fullTopic.id,
          currentMode,
          fullTopic.sentences?.length || topic.sentence_count || 0
        )
      );
    },
    [allTopics, currentMode]
  );

  const handleComplete = useCallback((finalResults) => {
    setResults(finalResults);
    setScreen(SCREENS.RESULT);

    if (!currentTopic) return;
    const total = finalResults.length;
    const correct = finalResults.filter((r) => r.correct).length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    setTopicProgress((prev) =>
      markTopicCompleted(prev, currentTopic.id, {
        score,
        mode: currentMode,
        totalQuestions: currentTopic.sentences?.length || total
      })
    );
  }, [currentMode, currentTopic]);

  const handlePlayProgress = useCallback((sessionState) => {
    if (!currentTopic) return;
    setTopicProgress((prev) =>
      updateTopicSession(prev, currentTopic.id, {
        mode: currentMode,
        totalQuestions: currentTopic.sentences?.length || 0,
        session: sessionState
      })
    );
  }, [currentMode, currentTopic]);

  const handleSaveCustom = useCallback(async (topic) => {
    await saveCustomTopic(topic);
    setCustomTopics((prev) => [...prev, { ...topic, isBuiltIn: false }]);
    goTopics();
  }, [goTopics]);

  const handleDeleteTopic = useCallback(
    async (id) => {
      if (!confirm('Xóa chủ đề này?')) return;
      await deleteCustomTopic(id);
      setCustomTopics((prev) => prev.filter((t) => t.id !== id));
      setTopicProgress((prev) => clearTopicProgress(prev, id));
    },
    []
  );

  const handleImport = useCallback(async (topic) => {
    await saveCustomTopic(topic);
    setCustomTopics((prev) => [...prev, { ...topic, isBuiltIn: false }]);
  }, []);

  const handleAIGenerate = useCallback(async (topic) => {
    await saveCustomTopic(topic);
    setCustomTopics((prev) => [...prev, { ...topic, isBuiltIn: false }]);
  }, []);

  const handleRestart = useCallback(() => {
    setResults([]);
    setScreen(SCREENS.PLAY);
  }, []);

  const handleGenerateFromMeetings = useCallback(async () => {
    setMeetingLoading(true);
    try {
      const data = await generateFromMeetings();
      const topic = {
        id: 'meeting_' + Date.now(),
        title: 'Meeting Notes',
        sentences: data.sentences
      };
      await saveCustomTopic(topic);
      setCustomTopics((prev) => [...prev, { ...topic, isBuiltIn: false }]);
      const filesList = data.filesUsed?.slice(0, 5).join(', ') + (data.filesUsed?.length > 5 ? `... và ${data.filesUsed.length - 5} file khác` : '');
      addToast(`Đã tạo ${data.sentences.length} câu từ ${data.filesUsed?.length || '?'} file meeting!\nFiles: ${filesList || 'N/A'}`, 'success', 6000);
    } catch (err) {
      addToast('Lỗi: ' + err.message, 'error');
    } finally {
      setMeetingLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="app" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className={`app ${screen === SCREENS.PLAY ? 'app-wide app-play' : ''}`}>
      <header className="masthead">
        <div className="logo">
          Dịch<span className="logo-accent">.</span>Câu
        </div>
        <div className="eyebrow" style={{ margin: 0 }}>
          Luyện dịch tiếng Anh
        </div>
      </header>

      {screen === SCREENS.TOPICS && (
        <TopicsScreen
          topics={allTopics}
          topicProgress={topicProgress}
          currentMode={currentMode}
          onSetMode={setCurrentMode}
          onStartTopic={startTopic}
          onOpenCreate={() => setScreen(SCREENS.CREATE)}
          onDeleteTopic={handleDeleteTopic}
          onOpenImport={() => setShowImport(true)}
          onOpenAIGenerate={() => setShowAIGenerate(true)}
          onGenerateFromMeetings={handleGenerateFromMeetings}
          onOpenDBViewer={() => setShowDBViewer(true)}
        />
      )}

      {meetingLoading && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: 'center' }}>
            <p>Đang đọc meeting notes và tạo câu...</p>
            <p className="hint">Vui lòng đợi một chút</p>
          </div>
        </div>
      )}

      {screen === SCREENS.CREATE && (
        <CreateTopicScreen onBack={goTopics} onSave={handleSaveCustom} onToast={(msg, type) => addToast(msg, type)} />
      )}

      {screen === SCREENS.PLAY && currentTopic && (
        <PlayScreen
          topic={currentTopic}
          mode={currentMode}
          initialProgress={topicProgress?.[currentTopic.id]}
          onProgress={handlePlayProgress}
          onBack={goTopics}
          onComplete={handleComplete}
        />
      )}

      {screen === SCREENS.RESULT && currentTopic && (
        <ResultScreen
          topic={currentTopic}
          results={results}
          onBack={goTopics}
          onRestart={handleRestart}
        />
      )}

      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} onImport={handleImport} />
      )}

      {showAIGenerate && (
        <AiGenerateModal
          onClose={() => setShowAIGenerate(false)}
          onGenerate={handleAIGenerate}
        />
      )}

      {showDBViewer && (
        <DBViewer onClose={() => setShowDBViewer(false)} />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
