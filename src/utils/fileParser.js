import mammoth from 'mammoth';

export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const text = await readAsText(file);

  if (ext === 'docx') {
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value;
  }

  if (ext === 'txt' || ext === 'md') {
    return text;
  }

  throw new Error('Định dạng file không được hỗ trợ. Vui lòng dùng .docx, .txt, hoặc .md');
}

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function parseSentences(text) {
  // Expect format: Vietnamese sentence | English words
  // Or each line is Vietnamese, next line is English
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  const sentences = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Try split by | or tab
    const parts = line.split(/\||\t/).map(p => p.trim());
    if (parts.length >= 2) {
      const vi = parts[0];
      const en = parts[1].split(/\s+/).filter(Boolean);
      if (vi && en.length > 0) {
        sentences.push({ vi, en });
      }
    } else {
      // Try pair of lines: vi then en
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const enWords = nextLine.split(/\s+/).filter(Boolean);
        // Heuristic: if next line looks like English (mostly ascii), treat as en
        if (enWords.length > 0 && isMostlyAscii(nextLine)) {
          sentences.push({ vi: line, en: enWords });
          i++;
        }
      }
    }
  }

  return sentences;
}

function isMostlyAscii(str) {
  const ascii = str.split('').filter(c => c.charCodeAt(0) < 128).length;
  return ascii / str.length > 0.7;
}
