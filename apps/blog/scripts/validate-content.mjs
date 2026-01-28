#!/usr/bin/env node

/**
 * 블로그 콘텐츠 검증 스크립트
 *
 * 검증 항목:
 * 1. ko/en 폴더에 동일한 파일(slug)이 존재하는지
 * 2. 동일 slug의 파일들이 같은 date를 가지는지
 * 3. 동일 slug의 파일들이 같은 tags를 가지는지
 *
 * 사용법:
 *   node validate-content.mjs              # 일반 출력
 *   node validate-content.mjs --summary    # GitHub Actions Summary용 마크다운 출력
 */

import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../content');
const LANGUAGES = ['ko', 'en'];
const PRIMARY_LANG = 'ko';
const OUTPUT_SUMMARY = process.argv.includes('--summary');

/**
 * 디렉토리 내 모든 .mdx 파일을 재귀적으로 찾음
 */
function findMdxFiles(dir, baseDir = dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findMdxFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * frontmatter 파싱
 */
function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(content);
  return data;
}

/**
 * 배열 동일성 비교 (undefined도 처리)
 */
function arraysEqual(a, b) {
  // 둘 다 undefined거나 null이면 동일
  if (a == null && b == null) return true;
  // 하나만 undefined/null이면 다름
  if (a == null || b == null) return false;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

/**
 * GitHub Actions Summary용 마크다운 생성
 */
function generateSummary(errors, warnings, commonFiles) {
  const lines = [];

  lines.push('## Blog Content Validation\n');

  if (errors.length === 0) {
    lines.push('### ✅ All checks passed!\n');
    lines.push(`- **Files validated**: ${commonFiles.length}`);
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
        const type = error.includes('파일이') ? 'Missing file' : 'Mismatch';
        lines.push(`| ${type} | \`${file}\` | ${detail} |`);
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

  if (errors.length === 0 && commonFiles.length > 0) {
    lines.push('<details>');
    lines.push(`<summary>📁 Validated files (${commonFiles.length})</summary>\n`);

    for (const file of commonFiles.sort()) {
      lines.push(`- \`${file}\``);
    }

    lines.push('\n</details>');
  }

  return lines.join('\n');
}

/**
 * 메인 검증 로직
 */
function validateContent() {
  const errors = [];
  const warnings = [];

  // 각 언어별 파일 목록 수집
  const filesByLang = {};
  for (const lang of LANGUAGES) {
    const langDir = path.join(CONTENT_DIR, lang);
    filesByLang[lang] = new Set(findMdxFiles(langDir));
  }

  const primaryFiles = filesByLang[PRIMARY_LANG];
  const secondaryLangs = LANGUAGES.filter(l => l !== PRIMARY_LANG);

  if (!OUTPUT_SUMMARY) {
    console.log('\n📁 파일 존재 여부 검증...\n');
  }

  // 1. 파일 존재 여부 검증
  // Primary 언어에만 있는 파일
  for (const file of primaryFiles) {
    for (const lang of secondaryLangs) {
      if (!filesByLang[lang].has(file)) {
        errors.push(`[${PRIMARY_LANG}] "${file}" 파일이 [${lang}]에 없습니다.`);
      }
    }
  }

  // Secondary 언어에만 있는 파일
  for (const lang of secondaryLangs) {
    for (const file of filesByLang[lang]) {
      if (!primaryFiles.has(file)) {
        errors.push(`[${lang}] "${file}" 파일이 [${PRIMARY_LANG}]에 없습니다.`);
      }
    }
  }

  if (!OUTPUT_SUMMARY) {
    console.log('📝 Frontmatter 검증...\n');
  }

  // 2. Frontmatter 동일성 검증
  // 모든 언어에 공통으로 존재하는 파일만 검증
  const commonFiles = [...primaryFiles].filter(file =>
    secondaryLangs.every(lang => filesByLang[lang].has(file))
  );

  for (const file of commonFiles) {
    const frontmatters = {};

    for (const lang of LANGUAGES) {
      const filePath = path.join(CONTENT_DIR, lang, file);
      try {
        frontmatters[lang] = parseFrontmatter(filePath);
      } catch (e) {
        errors.push(`[${lang}/${file}] frontmatter 파싱 실패: ${e.message}`);
      }
    }

    // 모든 언어의 frontmatter가 파싱되었는지 확인
    if (Object.keys(frontmatters).length !== LANGUAGES.length) {
      continue;
    }

    const primaryFm = frontmatters[PRIMARY_LANG];

    for (const lang of secondaryLangs) {
      const secondaryFm = frontmatters[lang];

      // date 비교
      if (primaryFm.date !== secondaryFm.date) {
        errors.push(
          `[${file}] date 불일치: [${PRIMARY_LANG}]="${primaryFm.date}" vs [${lang}]="${secondaryFm.date}"`
        );
      }

      // tags 비교
      if (!arraysEqual(primaryFm.tags, secondaryFm.tags)) {
        errors.push(
          `[${file}] tags 불일치: [${PRIMARY_LANG}]=${JSON.stringify(primaryFm.tags)} vs [${lang}]=${JSON.stringify(secondaryFm.tags)}`
        );
      }

      // draft 비교 (선택적 경고)
      if (primaryFm.draft !== secondaryFm.draft) {
        warnings.push(
          `[${file}] draft 불일치: [${PRIMARY_LANG}]=${primaryFm.draft} vs [${lang}]=${secondaryFm.draft}`
        );
      }
    }
  }

  // Summary 모드: 마크다운만 출력
  if (OUTPUT_SUMMARY) {
    console.log(generateSummary(errors, warnings, commonFiles));
    process.exit(errors.length > 0 ? 1 : 0);
  }

  // 일반 모드: 콘솔 출력
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

  console.log('\n✅ 모든 콘텐츠 검증 통과!\n');
  console.log(`  - 검증된 파일: ${commonFiles.length}개`);
  console.log(`  - 지원 언어: ${LANGUAGES.join(', ')}\n`);
}

validateContent();
