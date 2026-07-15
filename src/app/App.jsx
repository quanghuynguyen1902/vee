import '../index.css';
import AiGenerateModal from '../components/AiGenerateModal';
import DBViewer from '../components/DBViewer';
import ToastContainer from '../components/Toast';
import AppHeader from '../components/layout/AppHeader';
import AppLoading from '../components/layout/AppLoading';
import AppScreens from '../components/screens/AppScreens';
import { useAppState } from '../hooks/useAppState';

export default function App() {
  const state = useAppState();

  if (state.loading) {
    return <AppLoading />;
  }

  return (
    <div className={`app app-${state.screen} ${state.screen === state.SCREENS.PLAY ? 'app-wide app-play' : ''}`}>
      <AppHeader />

      <AppScreens {...state} />

      {state.showAIGenerate && (
        <AiGenerateModal onClose={() => state.setShowAIGenerate(false)} onGenerate={state.handleAIGenerate} />
      )}

      {state.showDBViewer && <DBViewer onClose={() => state.setShowDBViewer(false)} />}

      <ToastContainer toasts={state.toasts} onRemove={state.removeToast} />
    </div>
  );
}
