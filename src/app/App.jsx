import '../index.css';
import ImportModal from '../components/ImportModal';
import AiGenerateModal from '../components/AiGenerateModal';
import DBViewer from '../components/DBViewer';
import ToastContainer from '../components/Toast';
import AppHeader from '../components/layout/AppHeader';
import AppLoading from '../components/layout/AppLoading';
import MeetingLoadingModal from '../components/layout/MeetingLoadingModal';
import AppScreens from '../components/screens/AppScreens';
import { useAppState } from '../hooks/useAppState';

export default function App() {
  const state = useAppState();

  if (state.loading) {
    return <AppLoading />;
  }

  return (
    <div className={`app ${state.screen === state.SCREENS.PLAY ? 'app-wide app-play' : ''}`}>
      <AppHeader />

      <AppScreens {...state} />

      {state.meetingLoading && <MeetingLoadingModal />}

      {state.showImport && <ImportModal onClose={() => state.setShowImport(false)} onImport={state.handleImport} />}

      {state.showAIGenerate && (
        <AiGenerateModal onClose={() => state.setShowAIGenerate(false)} onGenerate={state.handleAIGenerate} />
      )}

      {state.showDBViewer && <DBViewer onClose={() => state.setShowDBViewer(false)} />}

      <ToastContainer toasts={state.toasts} onRemove={state.removeToast} />
    </div>
  );
}
