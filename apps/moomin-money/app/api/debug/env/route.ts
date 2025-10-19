import { NextResponse } from 'next/server';

/**
 * DEBUG ONLY: 환경변수 확인용
 * 본인의 환경변수가 제대로 로드되었는지 확인
 */
export async function GET() {
  return NextResponse.json({
    env: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✓ 설정됨' : '✗ 미설정',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✓ 설정됨' : '✗ 미설정',
      GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '✗ 미설정',
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY
        ? `✓ 설정됨 (길이: ${process.env.GOOGLE_PRIVATE_KEY.length}자)`
        : '✗ 미설정',
      SPREADSHEET_ID: process.env.SPREADSHEET_ID || '✗ 미설정',
      SHEET_NAME_USER1: process.env.SHEET_NAME_USER1 || '✗ 미설정',
      SHEET_NAME_USER2: process.env.SHEET_NAME_USER2 || '✗ 미설정',
      ALLOWED_EMAIL_1: process.env.ALLOWED_EMAIL_1 || '✗ 미설정',
      ALLOWED_EMAIL_2: process.env.ALLOWED_EMAIL_2 || '✗ 미설정',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '✗ 미설정',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ 설정됨' : '✗ 미설정',
    },
  });
}
