import { SCREENS } from '../app/constants';

export function parseRoute(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return { screen: SCREENS.TOPICS };
  if (parts[0] === 'create') return { screen: SCREENS.CREATE };
  if (parts[0] === 'play' && parts[1]) {
    return { screen: SCREENS.PLAY, topicId: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'result' && parts[1]) {
    return { screen: SCREENS.RESULT, topicId: decodeURIComponent(parts[1]) };
  }
  return { screen: SCREENS.TOPICS };
}

export function routeFor(screen, topicId) {
  if (screen === SCREENS.CREATE) return '/create';
  if (screen === SCREENS.PLAY && topicId) return `/play/${encodeURIComponent(topicId)}`;
  if (screen === SCREENS.RESULT && topicId) return `/result/${encodeURIComponent(topicId)}`;
  return '/';
}
