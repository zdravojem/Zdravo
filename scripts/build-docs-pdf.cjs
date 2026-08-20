const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const inputPath = path.join(projectRoot, 'docs', 'Zdravo-Jem-Project-Documentation.md');
const outputPath = path.join(projectRoot, 'docs', 'Zdravo-Jem-Project-Documentation.pdf');
const source = fs.readFileSync(inputPath, 'utf8').replace(/\r\n/g, '\n');

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const LEFT = 54;
const RIGHT = 54;
const TOP = 62;
const BOTTOM = 56;
const TEXT_W = PAGE_W - LEFT - RIGHT;
const pages = [];
let page = [];
let y = PAGE_H - TOP;

function pdfText(value) {
  return String(value).replace(/[^\x20-\x7e]/g, '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function plain(value) {
  return value.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').trim();
}

function drawText(text, x, baseline, size = 10, font = 'F1', color = '0.25 0.24 0.20') {
  page.push(`BT /${font} ${size} Tf ${color} rg 1 0 0 1 ${x.toFixed(2)} ${baseline.toFixed(2)} Tm (${pdfText(text)}) Tj ET`);
}

function drawLine(x1, y1, x2, y2, width = 1, color = '0.77 0.83 0.64') {
  page.push(`${color} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
}

function finishPage() {
  if (!page.length) return;
  pages.push(page);
  page = [];
  y = PAGE_H - TOP;
}

function ensureSpace(height) {
  if (y - height < BOTTOM) finishPage();
}

function wrap(text, size, width = TEXT_W, fontFactor = 0.51) {
  const words = plain(text).split(/\s+/).filter(Boolean);
  const maxChars = Math.max(12, Math.floor(width / (size * fontFactor)));
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) current = candidate;
    else { lines.push(current); current = word; }
  }
  if (current) lines.push(current);
  return lines;
}

function addParagraph(text, options = {}) {
  const size = options.size || 9.5;
  const leading = options.leading || 13;
  const indent = options.indent || 0;
  const hanging = options.hanging || '';
  const lines = wrap(text, size, TEXT_W - indent - (hanging ? 14 : 0), options.font === 'F3' ? 0.6 : 0.51);
  ensureSpace(lines.length * leading + 8);
  if (hanging) drawText(hanging, LEFT + indent, y, size, options.font || 'F1', options.color);
  const x = LEFT + indent + (hanging ? 14 : 0);
  for (const line of lines) { drawText(line, x, y, size, options.font || 'F1', options.color); y -= leading; }
  y -= options.after ?? 7;
}

function addHeading(text, level) {
  const size = level === 2 ? 15 : 11.5;
  const before = level === 2 ? 16 : 10;
  const after = level === 2 ? 8 : 5;
  const lines = wrap(text, size, TEXT_W, 0.54);
  ensureSpace(before + lines.length * (size + 3) + after + 14);
  y -= before;
  for (const line of lines) { drawText(line, LEFT, y, size, 'F2', '0.20 0.38 0.12'); y -= size + 3; }
  if (level === 2) drawLine(LEFT, y + 5, PAGE_W - RIGHT, y + 5, 0.7);
  y -= after;
}

// Branded cover page.
page.push('0.96 0.94 0.87 rg 0 0 595.28 841.89 re f');
page.push('0.35 0.55 0.18 rg 0 650 595.28 191.89 re f');
drawText('ZDRAVO JEM', LEFT, 720, 34, 'F2', '1 1 1');
drawText('Project Documentation', LEFT, 675, 24, 'F2', '1 1 1');
drawText('Technical, deployment, operations, and maintenance guide', LEFT, 615, 13);
drawText('Version 2.0', LEFT, 574, 12, 'F2', '0.35 0.55 0.18');
drawText('Prepared 16 August 2026', LEFT, 550, 11);
drawLine(LEFT, 515, PAGE_W - RIGHT, 515, 2, '0.72 0.48 0.28');
drawText('Installable PWA for a 55-inch portrait touchscreen kiosk', LEFT, 480, 11);
drawText('Slovenian and English interface', LEFT, 458, 11);
drawText('Secret-safe documentation: no keys, passwords, or tokens included', LEFT, 112, 9, 'F2', '0.46 0.30 0.18');
finishPage();

let paragraph = [];
let inCode = false;
let skippedTitle = false;

function flushParagraph() {
  if (!paragraph.length) return;
  addParagraph(paragraph.join(' '));
  paragraph = [];
}

for (const raw of source.split('\n')) {
  const line = raw.trimEnd();
  if (line.startsWith('```')) {
    flushParagraph();
    inCode = !inCode;
    if (!inCode) y -= 6;
    continue;
  }
  if (inCode) {
    ensureSpace(12);
    drawText(line || ' ', LEFT + 12, y, 7.6, 'F3', '0.27 0.25 0.22');
    y -= 10;
    continue;
  }
  const heading = /^(#{1,3})\s+(.+)$/.exec(line);
  if (heading) {
    flushParagraph();
    if (heading[1].length === 1 && !skippedTitle) { skippedTitle = true; continue; }
    addHeading(heading[2], heading[1].length);
    continue;
  }
  const bullet = /^-\s+(.+)$/.exec(line);
  if (bullet) { flushParagraph(); addParagraph(bullet[1], { indent: 8, hanging: '-', after: 3 }); continue; }
  const numbered = /^(\d+)\.\s+(.+)$/.exec(line);
  if (numbered) { flushParagraph(); addParagraph(numbered[2], { indent: 4, hanging: `${numbered[1]}.`, after: 3 }); continue; }
  if (!line.trim()) { flushParagraph(); continue; }
  paragraph.push(line.trim().replace(/\s{2}$/, ''));
}
flushParagraph();
finishPage();

// Running headers and page numbers.
for (let i = 1; i < pages.length; i += 1) {
  pages[i].unshift(
    '0.35 0.55 0.18 rg 0 812 595.28 29.89 re f',
    `BT /F2 8 Tf 1 1 1 rg 1 0 0 1 ${LEFT} 823 Tm (ZDRAVO JEM) Tj ET`,
    'BT /F1 8 Tf 1 1 1 rg 1 0 0 1 415 823 Tm (PROJECT DOCUMENTATION) Tj ET'
  );
  pages[i].push(
    `BT /F1 8 Tf 0.42 0.40 0.35 rg 1 0 0 1 ${LEFT} 28 Tm (Version 2.0) Tj ET`,
    `BT /F1 8 Tf 0.42 0.40 0.35 rg 1 0 0 1 480 28 Tm (Page ${i + 1}) Tj ET`
  );
}

function buildPdf(pageStreams) {
  const objects = [];
  const add = (body) => { objects.push(body); return objects.length; };
  const catalogRef = add('');
  const pagesRef = add('');
  const fontRegular = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBold = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const fontMono = add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');
  const pageRefs = [];
  for (const commands of pageStreams) {
    const stream = commands.join('\n') + '\n';
    const contentRef = add(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`);
    pageRefs.push(add(`<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R /F3 ${fontMono} 0 R >> >> /Contents ${contentRef} 0 R >>`));
  }
  objects[catalogRef - 1] = `<< /Type /Catalog /Pages ${pagesRef} 0 R >>`;
  objects[pagesRef - 1] = `<< /Type /Pages /Count ${pageRefs.length} /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(' ')}] >>`;
  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [0];
  objects.forEach((body, index) => { offsets.push(Buffer.byteLength(pdf, 'binary')); pdf += `${index + 1} 0 obj\n${body}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf, 'binary');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogRef} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'binary');
}

const pdf = buildPdf(pages);
fs.writeFileSync(outputPath, pdf);
console.log(`Wrote ${path.relative(projectRoot, outputPath)} (${pages.length} pages, ${pdf.length} bytes)`);
