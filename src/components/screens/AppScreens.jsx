import TopicsScreen from '../TopicsScreen';
import CreateTopicScreen from '../CreateTopicScreen';
import PlayScreen from '../PlayScreen';
import ResultScreen from '../ResultScreen';

export default function AppScreens({
  SCREENS,
  allTopics,
  currentMode,
  currentTopic,
  results,
  screen,
  topicProgress,
  addToast,
  openCreate,
  setCurrentMode,
  setShowAIGenerate,
  setShowDBViewer,
  setShowImport,
  startTopic,
  goTopics,
  handleDeleteTopic,
  handleSaveCustom,
  handlePlayProgress,
  handleComplete,
  handleRestart,
  handleGenerateFromMeetings
}) {
  return (
    <>
      {screen === SCREENS.TOPICS && (
        <TopicsScreen
          topics={allTopics}
          topicProgress={topicProgress}
          currentMode={currentMode}
          onSetMode={setCurrentMode}
          onStartTopic={startTopic}
          onOpenCreate={openCreate}
          onDeleteTopic={handleDeleteTopic}
          onOpenImport={() => setShowImport(true)}
          onOpenAIGenerate={() => setShowAIGenerate(true)}
          onGenerateFromMeetings={handleGenerateFromMeetings}
          onOpenDBViewer={() => setShowDBViewer(true)}
        />
      )}

      {screen === SCREENS.CREATE && (
        <CreateTopicScreen
          onBack={() => goTopics(false)}
          onSave={handleSaveCustom}
          onToast={(msg, type) => addToast(msg, type)}
        />
      )}

      {screen === SCREENS.PLAY && currentTopic && (
        <PlayScreen
          topic={currentTopic}
          mode={currentMode}
          initialProgress={topicProgress?.[currentTopic.id]}
          onProgress={handlePlayProgress}
          onBack={() => goTopics(false)}
          onComplete={handleComplete}
        />
      )}

      {screen === SCREENS.RESULT && currentTopic && (
        <ResultScreen
          topic={currentTopic}
          results={results}
          onBack={() => goTopics(false)}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
