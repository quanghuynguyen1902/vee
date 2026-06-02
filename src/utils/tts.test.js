import test from 'node:test';
import assert from 'node:assert/strict';

async function loadTtsModule() {
  try {
    return await import('./tts.js');
  } catch {
    return {};
  }
}

test('prefers premium US English voices when available', async () => {
  const tts = await loadTtsModule();
  const voice = tts.choosePreferredVoice?.(
    [
      { name: 'Google US English', lang: 'en-US' },
      { name: 'Microsoft David', lang: 'en-US' },
      { name: 'Google UK English Female', lang: 'en-GB' }
    ],
    'en-US'
  );

  assert.equal(voice?.name, 'Google US English');
});

test('falls back to locale match when premium voice is unavailable', async () => {
  const tts = await loadTtsModule();
  const voice = tts.choosePreferredVoice?.(
    [
      { name: 'Narrator', lang: 'en-GB' },
      { name: 'Backup', lang: 'en-US' }
    ],
    'en-GB'
  );

  assert.equal(voice?.lang, 'en-GB');
});

test('builds slower english playback settings for practice mode', async () => {
  const tts = await loadTtsModule();
  const settings = tts.buildSpeechSettings?.({ lang: 'en-GB', slow: true });

  assert.deepEqual(settings, {
    lang: 'en-GB',
    rate: 0.85
  });
});
