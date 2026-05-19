import mammoth from 'mammoth';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEETING_DIR = path.resolve(__dirname, '../../meeting');

export async function extractAllMeetingText() {
  try {
    const files = await fs.readdir(MEETING_DIR);
    const docxFiles = files.filter((f) => f.endsWith('.docx'));

    if (docxFiles.length === 0) {
      return { text: '', count: 0, files: [] };
    }

    let allText = '';
    const processedFiles = [];
    for (const file of docxFiles) {
      const filePath = path.join(MEETING_DIR, file);
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        const clean = result.value
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        if (clean.length > 50) {
          allText += `\n\n--- ${file} ---\n\n${clean}`;
          processedFiles.push(file);
        }
      } catch (err) {
        console.warn(`Skip ${file}:`, err.message);
      }
    }

    return { text: allText.trim(), count: docxFiles.length, files: processedFiles };
  } catch (err) {
    console.error('Error reading meetings:', err.message);
    return { text: '', count: 0, files: [] };
  }
}

export async function extractRandomMeetingFiles(sampleSize = 15) {
  try {
    const files = await fs.readdir(MEETING_DIR);
    const docxFiles = files.filter((f) => f.endsWith('.docx'));

    if (docxFiles.length === 0) {
      return { text: '', count: 0, files: [] };
    }

    // Fisher-Yates shuffle for better randomness
    const shuffled = [...docxFiles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, Math.min(sampleSize, docxFiles.length));

    let allText = '';
    const processedFiles = [];
    for (const file of selected) {
      const filePath = path.join(MEETING_DIR, file);
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        const clean = result.value
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        if (clean.length > 50) {
          allText += `\n\n--- ${file} ---\n\n${clean}`;
          processedFiles.push(file);
        }
      } catch (err) {
        console.warn(`Skip ${file}:`, err.message);
      }
    }

    return { text: allText.trim(), count: docxFiles.length, files: processedFiles };
  } catch (err) {
    console.error('Error reading meetings:', err.message);
    return { text: '', count: 0, files: [] };
  }
}
