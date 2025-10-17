/**
 * ⚠️ 중요: 이 파일은 삭제하면 안 됩니다!
 *
 * 이 파일이 필요한 이유:
 * - ESLint 설정 파일 누락으로 인한 pre-commit 훅 실패 방지
 * - root 디렉토리에서 ESLint 규칙 적용
 * - husky + lint-staged가 정상 작동하기 위한 필수 파일
 * - GitHub Actions CI 파이프라인에서 lint 단계 정상 실행
 *
 * 만약 이 파일을 삭제하면:
 * - git commit 시 pre-commit 훅에서 ESLint 오류 발생
 * - CI 파이프라인에서 lint 단계 실패
 * - 코드 품질 검사가 작동하지 않음
 *
 * 주의: 실수로 삭제하지 마세요!
 */

import { config as baseConfig } from './packages/eslint-config/base.js';

export default baseConfig;
