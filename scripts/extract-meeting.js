const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || 'meeting/Dev-Cycle Daily Connect - 2026_05_07 09_59 GMT+08_00 - Notes by Gemini.docx';

async function extract() {
  try {
    const result = await mammoth.extractRawText({ path: file });
    console.log(result.value.substring(0, 3000));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

extract();
