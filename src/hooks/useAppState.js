import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCustomTopics, saveCustomTopic, deleteCustomTopic, getTopic } from '../utils/storage';
import {
  fetchTopicProgress,
  persistTopicProgress,
  markTopicStarted,
  markTopicCompleted,
  updateTopicSession,
  clearTopicProgress
} from '../utils/progress';
import { SCREENS } from '../app/constants';
import { parseRoute, routeFor } from '../lib/routes';
import { useToast } from '../components/Toast';

export function useAppState() {
  const navigate = useNavigate();
  const location = useLocation();
  const [screen, setScreen] = useState(SCREENS.TOPICS);
  const [currentMode, setCurrentMode] = useState('drag');
  const [currentTopic, setCurrentTopic] = useState(null);
  const [results, setResults] = useState([]);
  const [customTopics, setCustomTopics] = useState([]);
  const [topicProgress, setTopicProgress] = useState({});
  const [progressReady, setProgressReady] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [showDBViewer, setShowDBViewer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [routeHandled, setRouteHandled] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

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
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!progressReady) return;
    persistTopicProgress(topicProgress);
  }, [progressReady, topicProgress]);

  useEffect(() => {
    let cancelled = false;
    async function loadProgress() {
      const progress = await fetchTopicProgress();
      if (!cancelled) {
        setTopicProgress(progress || {});
        setProgressReady(true);
      }
    }
    loadProgress();
    return () => {
      cancelled = true;
    };
  }, []);

  const allTopics = useMemo(() => {
    return customTopics.map((t) => ({ ...t, isBuiltIn: false }));
  }, [customTopics]);

  const startTopic = useCallback(
    async (id, options = {}) => {
      const { fromRoute = false, targetScreen = SCREENS.PLAY } = options;
      const topic = allTopics.find((t) => t.id === id);
      if (!topic) return false;

      let fullTopic = topic;
      if (!topic.isBuiltIn) {
        try {
          const detail = await getTopic(id);
          if (detail) fullTopic = { ...detail, id: detail.id || id };
        } catch (err) {
          console.warn('Could not fetch topic detail:', err);
        }
      }

      setCurrentTopic(fullTopic);
      if (targetScreen === SCREENS.PLAY) setResults([]);
      setScreen(targetScreen);
      if (!fromRoute) navigate(routeFor(targetScreen, id));

      if (targetScreen === SCREENS.PLAY) {
        setTopicProgress((prev) =>
          markTopicStarted(
            prev,
            fullTopic.id,
            currentMode,
            fullTopic.sentences?.length || topic.sentence_count || 0
          )
        );
      }
      return true;
    },
    [allTopics, currentMode, navigate]
  );

  const goTopics = useCallback(
    (fromRoute = false) => {
      setScreen(SCREENS.TOPICS);
      setCurrentTopic(null);
      setResults([]);
      if (!fromRoute) navigate(routeFor(SCREENS.TOPICS));
    },
    [navigate]
  );

  const openCreate = useCallback(() => {
    setScreen(SCREENS.CREATE);
    setCurrentTopic(null);
    setResults([]);
    navigate(routeFor(SCREENS.CREATE));
  }, [navigate]);

  const handleComplete = useCallback(
    (finalResults) => {
      setResults(finalResults);
      setScreen(SCREENS.RESULT);
      if (currentTopic?.id) {
        navigate(routeFor(SCREENS.RESULT, currentTopic.id));
      }

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
    },
    [currentMode, currentTopic, navigate]
  );

  const handlePlayProgress = useCallback(
    (sessionState) => {
      if (!currentTopic) return;
      setTopicProgress((prev) =>
        updateTopicSession(prev, currentTopic.id, {
          mode: currentMode,
          totalQuestions: currentTopic.sentences?.length || 0,
          session: sessionState
        })
      );
    },
    [currentMode, currentTopic]
  );

  const handleSaveCustom = useCallback(
    async (topic) => {
      await saveCustomTopic(topic);
      setCustomTopics((prev) => [...prev, { ...topic, isBuiltIn: false }]);
      goTopics();
    },
    [goTopics]
  );

  const handleDeleteTopic = useCallback(async (id) => {
    if (!confirm('Xóa chủ đề này?')) return;
    await deleteCustomTopic(id);
    setCustomTopics((prev) => prev.filter((t) => t.id !== id));
    setTopicProgress((prev) => clearTopicProgress(prev, id));
  }, []);

  const handleAIGenerate = useCallback(async (topic) => {
    await saveCustomTopic(topic);
    setCustomTopics((prev) => [...prev, { ...topic, isBuiltIn: false }]);
  }, []);

  const handleRestart = useCallback(() => {
    setResults([]);
    setScreen(SCREENS.PLAY);
    if (currentTopic?.id) {
      navigate(routeFor(SCREENS.PLAY, currentTopic.id));
    }
  }, [currentTopic, navigate]);

  useEffect(() => {
    if (loading || routeHandled) return;

    const applyRoute = async (fromPopState = false) => {
      const route = parseRoute(location.pathname);
      if (route.screen === SCREENS.TOPICS) {
        goTopics(true);
      } else if (route.screen === SCREENS.CREATE) {
        setScreen(SCREENS.CREATE);
        setCurrentTopic(null);
        setResults([]);
      } else if ((route.screen === SCREENS.PLAY || route.screen === SCREENS.RESULT) && route.topicId) {
        const ok = await startTopic(route.topicId, { fromRoute: true, targetScreen: route.screen });
        if (!ok && !fromPopState) {
          goTopics(true);
          navigate(routeFor(SCREENS.TOPICS), { replace: true });
        }
      } else {
        goTopics(true);
      }
    };

    applyRoute(false).finally(() => setRouteHandled(true));
  }, [goTopics, loading, routeHandled, startTopic, location.pathname, navigate]);

  useEffect(() => {
    if (loading || !routeHandled) return;
    const route = parseRoute(location.pathname);
    if (route.screen === SCREENS.TOPICS) goTopics(true);
    if (route.screen === SCREENS.CREATE) {
      setScreen(SCREENS.CREATE);
      setCurrentTopic(null);
      setResults([]);
    }
    if ((route.screen === SCREENS.PLAY || route.screen === SCREENS.RESULT) && route.topicId) {
      startTopic(route.topicId, { fromRoute: true, targetScreen: route.screen });
    }
  }, [location.pathname, loading, routeHandled, goTopics, startTopic]);

  return {
    SCREENS,
    allTopics,
    currentMode,
    currentTopic,
    loading,
    results,
    screen,
    showAIGenerate,
    showDBViewer,
    topicProgress,
    toasts,
    addToast,
    removeToast,
    openCreate,
    setCurrentMode,
    setShowAIGenerate,
    setShowDBViewer,
    startTopic,
    goTopics,
    handleDeleteTopic,
    handleSaveCustom,
    handleAIGenerate,
    handlePlayProgress,
    handleComplete,
    handleRestart
  };
}
