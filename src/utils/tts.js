const PREMIUM_VOICE_KEYWORDS = {
  'en-US': [
    'google us english',
    'microsoft aria',
    'microsoft jenny',
    'samantha',
    'allison',
    'ava',
    'emma'
  ],
  'en-GB': [
    'google uk english',
    'microsoft libby',
    'microsoft sonia',
    'daniel',
    'serena'
  ],
  'vi-VN': [
    'google tiếng việt',
    'microsoft hoai my'
  ]
};

function normalize(value = '') {
  return value.trim().toLowerCase();
}

function scoreVoice(voice, targetLang) {
  const normalizedLang = normalize(voice.lang);
  const normalizedName = normalize(voice.name);
  const preferredKeywords = PREMIUM_VOICE_KEYWORDS[targetLang] || [];
  const baseLang = normalize(targetLang).split('-')[0];

  if (preferredKeywords.some((keyword) => normalizedName.includes(keyword))) return 400;
  if (normalizedLang === normalize(targetLang)) return 300;
  if (normalizedLang.startsWith(`${baseLang}-`)) return 200;
  if (normalizedLang.startsWith(baseLang)) return 100;
  return 0;
}

export function choosePreferredVoice(voices = [], targetLang = 'en-US') {
  if (!Array.isArray(voices) || voices.length === 0) return null;

  let bestVoice = null;
  let bestScore = -1;

  for (const voice of voices) {
    const score = scoreVoice(voice, targetLang);
    if (score > bestScore) {
      bestVoice = voice;
      bestScore = score;
    }
  }

  return bestScore > 0 ? bestVoice : voices[0];
}

export function buildSpeechSettings({ lang = 'en-US', slow = false } = {}) {
  return {
    lang,
    rate: slow ? 0.85 : lang.startsWith('en') ? 0.95 : 0.92
  };
}
