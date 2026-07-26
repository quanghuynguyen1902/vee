// Mock AI service - replace with real API call
export async function generateSentencePairs(vietnameseText) {
  // For demo purposes, we'll do a simple split and mock generation
  const sentences = vietnameseText
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const pairs = sentences.map((vi) => {
    return {
      vi,
      en: mockTranslate(vi)
    };
  });

  return pairs;
}

function mockTranslate(vi) {
  // Very naive mock - just returns placeholder words based on length
  const wordCount = Math.max(3, Math.min(10, Math.ceil(vi.length / 8)));
  const commonWords = ['the', 'is', 'are', 'this', 'that', 'with', 'from', 'have', 'has', 'been', 'was', 'were', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'do', 'does', 'did'];
  const result = [];
  for (let i = 0; i < wordCount; i++) {
    result.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
  }
  return result;
}

export async function generatePairsWithAI(vietnameseText) {
  // Call local backend API - API key is safe on server
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: vietnameseText })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.sentences || [];
  } catch (err) {
    // Fallback to mock if backend is not available
    console.warn('Backend not available, using mock:', err.message);
    return generateSentencePairs(vietnameseText);
  }
}

export async function generateFromTopic(topicName) {
  try {
    const response = await fetch('/api/generate-from-topic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic: topicName })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.sentences || [];
  } catch (err) {
    console.warn('Topic generation failed:', err.message);
    throw err;
  }
}

export async function processTranscriptWithAI(transcript) {
  const response = await fetch('/api/process-transcript', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ transcript })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${response.status}`);
  }

  const data = await response.json();
  return {
    title: data.title || '',
    sentences: Array.isArray(data.sentences) ? data.sentences : []
  };
}
