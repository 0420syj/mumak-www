#!/usr/bin/env node

import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../content');
const GARDEN_DIR = 'garden';
const LANGUAGES = ['ko', 'en'];
const PRIMARY_LANG = 'ko';
const OUTPUT_SUMMARY = process.argv.includes('--summary');

const VALID_STATUSES = ['seedling', 'budding', 'evergreen'];
const REQUIRED_FIELDS = ['title', 'created', 'status'];

const WIKILINK_PATTERN = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

function extractWikilinkSlugs(content) {
  return [...content.matchAll(WIKILINK_PATTERN)].map(match => match[1]);
}

function getMdxSlugsInDir(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.mdx'))
    .map(entry => entry.name.replace(/\.mdx$/, ''));
}

function parseNoteFile(filePath) {
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));
  return { frontmatter: data, content };
}

function arraysHaveSameElements(a, b) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;

  const sorted = arr => [...arr].sort();
  return sorted(a).every((val, idx) => val === sorted(b)[idx]);
}

function generateSummary(errors, warnings, stats) {
  const lines = [];

  lines.push('## Garden Content Validation\n');

  if (errors.length === 0) {
    lines.push('### ✅ All checks passed!\n');
    lines.push(`- **Notes validated**: ${stats.totalNotes}`);
    lines.push(`- **Wikilinks checked**: ${stats.totalLinks}`);
    lines.push(`- **Languages**: ${LANGUAGES.join(', ')}\n`);
  } else {
    lines.push('### ❌ Validation failed\n');
  }

  if (errors.length > 0) {
    lines.push('<details>');
    lines.push(`<summary>🚨 Errors (${errors.length})</summary>\n`);
    lines.push('| Type | File | Details |');
    lines.push('|------|------|---------|');

    for (const error of errors) {
      const match = error.match(/\[([^\]]+)\]\s*(.+)/);
      if (match) {
        const file = match[1];
        const detail = match[2].replace(/\|/g, '\\|');
        lines.push(`| Error | \`${file}\` | ${detail} |`);
      } else {
        lines.push(`| Error | - | ${error} |`);
      }
    }

    lines.push('\n</details>\n');
  }

  if (warnings.length > 0) {
    lines.push('<details>');
    lines.push(`<summary>⚠️ Warnings (${warnings.length})</summary>\n`);
    lines.push('| File | Details |');
    lines.push('|------|---------|');

    for (const warning of warnings) {
      const match = warning.match(/\[([^\]]+)\]\s*(.+)/);
      if (match) {
        lines.push(`| \`${match[1]}\` | ${match[2].replace(/\|/g, '\\|')} |`);
      }
    }

    lines.push('\n</details>\n');
  }

  return lines.join('\n');
}

function collectFilesByLanguage() {
  return LANGUAGES.reduce((acc, lang) => {
    const gardenPath = path.join(CONTENT_DIR, lang, GARDEN_DIR);
    acc[lang] = new Set(getMdxSlugsInDir(gardenPath));
    return acc;
  }, {});
}

function checkLanguageSync(filesByLang, primaryFiles, secondaryLangs) {
  const warnings = [];

  for (const file of primaryFiles) {
    for (const lang of secondaryLangs) {
      if (!filesByLang[lang].has(file)) {
        warnings.push(`[${PRIMARY_LANG}/${file}] "${file}" 노트가 [${lang}]에 없습니다.`);
      }
    }
  }

  for (const lang of secondaryLangs) {
    for (const file of filesByLang[lang]) {
      if (!primaryFiles.has(file)) {
        warnings.push(`[${lang}/${file}] "${file}" 노트가 [${PRIMARY_LANG}]에 없습니다.`);
      }
    }
  }

  return warnings;
}

function validateNote(lang, slug, existingSlugs) {
  const errors = [];
  const filePath = path.join(CONTENT_DIR, lang, GARDEN_DIR, `${slug}.mdx`);

  let parsed;
  try {
    parsed = parseNoteFile(filePath);
  } catch (e) {
    return { errors: [`[${lang}/${slug}] 파일 파싱 실패: ${e.message}`], linkCount: 0 };
  }

  const { frontmatter, content } = parsed;

  REQUIRED_FIELDS
    .filter(field => !frontmatter[field])
    .forEach(field => errors.push(`[${lang}/${slug}] 필수 필드 누락: ${field}`));

  if (frontmatter.status && !VALID_STATUSES.includes(frontmatter.status)) {
    errors.push(`[${lang}/${slug}] 유효하지 않은 status: "${frontmatter.status}" (허용: ${VALID_STATUSES.join(', ')})`);
  }

  const wikilinks = extractWikilinkSlugs(content);
  wikilinks
    .filter(linkedSlug => !existingSlugs.has(linkedSlug))
    .forEach(linkedSlug => errors.push(`[${lang}/${slug}] 깨진 위키링크: [[${linkedSlug}]] (존재하지 않는 노트)`));

  return { errors, linkCount: wikilinks.length };
}

function checkFrontmatterConsistency(commonFiles, secondaryLangs) {
  const warnings = [];

  for (const slug of commonFiles) {
    const frontmatters = LANGUAGES.reduce((acc, lang) => {
      try {
        acc[lang] = parseNoteFile(path.join(CONTENT_DIR, lang, GARDEN_DIR, `${slug}.mdx`)).frontmatter;
      } catch {
        // 파싱 실패는 validateNote에서 이미 처리됨
      }
      return acc;
    }, {});

    if (Object.keys(frontmatters).length !== LANGUAGES.length) continue;

    const primaryFm = frontmatters[PRIMARY_LANG];

    for (const lang of secondaryLangs) {
      const secondaryFm = frontmatters[lang];

      if (!arraysHaveSameElements(primaryFm.tags, secondaryFm.tags)) {
        warnings.push(
          `[${slug}] tags 불일치: [${PRIMARY_LANG}]=${JSON.stringify(primaryFm.tags)} vs [${lang}]=${JSON.stringify(secondaryFm.tags)}`
        );
      }

      if (primaryFm.status !== secondaryFm.status) {
        warnings.push(
          `[${slug}] status 불일치: [${PRIMARY_LANG}]="${primaryFm.status}" vs [${lang}]="${secondaryFm.status}"`
        );
      }
    }
  }

  return warnings;
}

function printResults(errors, warnings, stats) {
  console.log('━'.repeat(50));

  if (warnings.length > 0) {
    console.log('\n⚠️  경고:\n');
    warnings.forEach(w => console.log(`  ${w}`));
  }

  if (errors.length > 0) {
    console.log('\n❌ 오류:\n');
    errors.forEach(e => console.log(`  ${e}`));
    console.log(`\n총 ${errors.length}개의 오류가 발견되었습니다.\n`);
    process.exit(1);
  }

  console.log('\n✅ 모든 가든 콘텐츠 검증 통과!\n');
  console.log(`  - 검증된 노트: ${stats.totalNotes}개`);
  console.log(`  - 검증된 위키링크: ${stats.totalLinks}개`);
  console.log(`  - 지원 언어: ${LANGUAGES.join(', ')}\n`);
}

function validateGarden() {
  const filesByLang = collectFilesByLanguage();
  const primaryFiles = filesByLang[PRIMARY_LANG];
  const secondaryLangs = LANGUAGES.filter(l => l !== PRIMARY_LANG);

  const warnings = checkLanguageSync(filesByLang, primaryFiles, secondaryLangs);

  if (!OUTPUT_SUMMARY) {
    console.log('\n📁 파일 존재 여부 검증...\n');
    console.log('📝 Frontmatter 및 위키링크 검증...\n');
  }

  const stats = { totalNotes: 0, totalLinks: 0 };
  const errors = [];

  for (const lang of LANGUAGES) {
    const existingSlugs = filesByLang[lang];

    for (const slug of existingSlugs) {
      stats.totalNotes++;
      const result = validateNote(lang, slug, existingSlugs);
      errors.push(...result.errors);
      stats.totalLinks += result.linkCount;
    }
  }

  const commonFiles = [...primaryFiles].filter(file => secondaryLangs.every(lang => filesByLang[lang].has(file)));
  warnings.push(...checkFrontmatterConsistency(commonFiles, secondaryLangs));

  if (OUTPUT_SUMMARY) {
    console.log(generateSummary(errors, warnings, stats));
    process.exit(errors.length > 0 ? 1 : 0);
  }

  printResults(errors, warnings, stats);
}

validateGarden();
