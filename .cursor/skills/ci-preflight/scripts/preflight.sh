#!/bin/bash
# CI Preflight 검증 스크립트
# 사용법: ./scripts/preflight.sh [app-name]
# app-name 미지정 시 변경된 부분만 검증

set -e

FILTER=""
if [ -n "$1" ]; then
    FILTER="--filter=$1"
    echo "🔍 앱 지정: $1"
else
    FILTER="--filter=[origin/develop...HEAD]"
    echo "🔍 변경된 부분만 검증 (origin/develop 기준)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1/4 Type Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pnpm turbo run check-types $FILTER

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2/4 Lint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pnpm turbo run lint $FILTER

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3/4 Format Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pnpm turbo run format:check $FILTER

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4/4 Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pnpm turbo run test:ci $FILTER

echo ""
echo "✅ 모든 검증 통과!"
