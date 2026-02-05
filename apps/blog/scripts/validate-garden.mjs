#!/usr/bin/env node

/**
 * 디지털 가든 콘텐츠 검증 스크립트
 *
 * 검증 항목:
 * 1. 필수 frontmatter 필드 존재 여부 (title, created, status)
 * 2. status 값이 유효한지 (seedling, budding, evergreen)
 * 3. 위키링크가 존재하는 노트를 참조하는지 (깨진 링크 체크)
 * 4. ko/en 폴더에 동일한 파일(slug)이 존재하는지
 * 5. 동일 slug의 파일들이 같은 tags를 가지는지
 *
 * 사용법:
 *   node validate-garden.mjs              # 일반 출력
 *   node validate-garden.mjs --summary    # GitHub Actions Summary용 마크다운 출력
 */

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

/**
 * 위키링크 slug 추출
 */
function extractWikilinkSlugs(content) {
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  const slugs = [];
  let match;

  while ((match = wikiLinkRegex.exec(content)) !== null) {
    slugs.push(match[1]);
  }

  return slugs;
}

/**
 * 디렉토리 내 모든 .mdx 파일을 찾음
 */
function findMdxFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(entry.name.replace(/\.mdx$/, ''));
    }
  }

  return files;
}

/**
 * frontmatter와 content 파싱
 */
function parseNoteFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  return { frontmatter: data, content };
}

/**
 * 배열 동일성 비교
 */
function arraysEqual(a, b) {
  if (a == null && b == null) return true;
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

/**
 * 메인 검증 로직
 */
function validateGarden() {
  const errors = [];
  const warnings = [];
  const stats = { totalNotes: 0, totalLinks: 0 };

  // 각 언어별 파일 목록 수집
  const filesByLang = {};
  for (const lang of LANGUAGES) {
    const gardenPath = path.join(CONTENT_DIR, lang, GARDEN_DIR);
    filesByLang[lang] = new Set(findMdxFiles(gardenPath));
  }

  const primaryFiles = filesByLang[PRIMARY_LANG];
  const secondaryLangs = LANGUAGES.filter(l => l !== PRIMARY_LANG);

  if (!OUTPUT_SUMMARY) {
    console.log('\n📁 파일 존재 여부 검증...\n');
  }

  // 1. 파일 존재 여부 검증 (언어 간 동기화)
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

  if (!OUTPUT_SUMMARY) {
    console.log('📝 Frontmatter 및 위키링크 검증...\n');
  }

  // 2. 각 언어별 노트 검증
  for (const lang of LANGUAGES) {
    const gardenPath = path.join(CONTENT_DIR, lang, GARDEN_DIR);
    const slugs = filesByLang[lang];
    const existingSlugs = new Set(slugs);

    for (const slug of slugs) {
      const filePath = path.join(gardenPath, `${slug}.mdx`);
      stats.totalNotes++;

      let parsed;
      try {
        parsed = parseNoteFile(filePath);
      } catch (e) {
        errors.push(`[${lang}/${slug}] 파일 파싱 실패: ${e.message}`);
        continue;
      }

      const { frontmatter, content } = parsed;

      // 필수 필드 검증
      for (const field of REQUIRED_FIELDS) {
        if (!frontmatter[field]) {
          errors.push(`[${lang}/${slug}] 필수 필드 누락: ${field}`);
        }
      }

      // status 값 검증
      if (frontmatter.status && !VALID_STATUSES.includes(frontmatter.status)) {
        errors.push(
          `[${lang}/${slug}] 유효하지 않은 status: "${frontmatter.status}" (허용: ${VALID_STATUSES.join(', ')})`
        );
      }

      // 위키링크 검증 (깨진 링크 체크)
      const wikilinks = extractWikilinkSlugs(content);
      stats.totalLinks += wikilinks.length;

      for (const linkedSlug of wikilinks) {
        if (!existingSlugs.has(linkedSlug)) {
          errors.push(`[${lang}/${slug}] 깨진 위키링크: [[${linkedSlug}]] (존재하지 않는 노트)`);
        }
      }
    }
  }

  // 3. 공통 파일의 frontmatter 동일성 검증
  const commonFiles = [...primaryFiles].filter(file =>
    secondaryLangs.every(lang => filesByLang[lang].has(file))
  );

  for (const slug of commonFiles) {
    const frontmatters = {};

    for (const lang of LANGUAGES) {
      const filePath = path.join(CONTENT_DIR, lang, GARDEN_DIR, `${slug}.mdx`);
      try {
        const { frontmatter } = parseNoteFile(filePath);
        frontmatters[lang] = frontmatter;
      } catch {
        // 이미 위에서 에러 처리됨
      }
    }

    if (Object.keys(frontmatters).length !== LANGUAGES.length) {
      continue;
    }

    const primaryFm = frontmatters[PRIMARY_LANG];

    for (const lang of secondaryLangs) {
      const secondaryFm = frontmatters[lang];

      // tags 비교
      if (!arraysEqual(primaryFm.tags, secondaryFm.tags)) {
        warnings.push(
          `[${slug}] tags 불일치: [${PRIMARY_LANG}]=${JSON.stringify(primaryFm.tags)} vs [${lang}]=${JSON.stringify(secondaryFm.tags)}`
        );
      }

      // status 비교
      if (primaryFm.status !== secondaryFm.status) {
        warnings.push(
          `[${slug}] status 불일치: [${PRIMARY_LANG}]="${primaryFm.status}" vs [${lang}]="${secondaryFm.status}"`
        );
      }
    }
  }

  // Summary 모드: 마크다운만 출력
  if (OUTPUT_SUMMARY) {
    console.log(generateSummary(errors, warnings, stats));
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

  console.log('\n✅ 모든 가든 콘텐츠 검증 통과!\n');
  console.log(`  - 검증된 노트: ${stats.totalNotes}개`);
  console.log(`  - 검증된 위키링크: ${stats.totalLinks}개`);
  console.log(`  - 지원 언어: ${LANGUAGES.join(', ')}\n`);
}

validateGarden();
