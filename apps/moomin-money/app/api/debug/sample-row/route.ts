import { getUserSheet } from '@/lib/google-sheets';
import { NextResponse } from 'next/server';

const SHEET_CONFIG = {
  HEADER_ROW: 1,
  DATA_START_COLUMN: 'A',
  DATA_START_ROW: 2,
  get DATA_RANGE() {
    return `${this.DATA_START_COLUMN}${this.DATA_START_ROW}`;
  },
};

/**
 * DEBUG ONLY: 첫 몇 개 행의 실제 데이터 구조 확인
 */
export async function GET() {
  try {
    // User1 시트에서 샘플 데이터 조회 (인증 제거)
    const sheet = await getUserSheet('User1');
    console.log('[DEBUG] Getting sample rows...');

    // @ts-expect-error - range is a valid option in google-spreadsheet
    const rows = await sheet.getRows({ range: SHEET_CONFIG.DATA_RANGE });

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        error: 'No rows found',
      });
    }

    console.log('[DEBUG] Total rows:', rows.length);
    console.log('[DEBUG] First row type:', typeof rows[0]);
    console.log('[DEBUG] First row constructor:', rows[0]?.constructor?.name);

    // 첫 3개 행의 데이터 상세히 확인
    const sampleRows = rows.slice(0, 3).map((row, idx) => {
      console.log(`[DEBUG] Row ${idx}:`, row.constructor.name);

      // row.get() 메서드로 각 컬럼 조회
      const columns: Record<string, string | undefined> = {};
      for (let i = 0; i < 15; i++) {
        const col = String.fromCharCode(65 + i); // A=65, B=66, ...
        try {
          columns[col] = row.get(col);
          if (columns[col]) {
            console.log(`[DEBUG]   ${col}: ${columns[col]}`);
          }
        } catch {
          // skip errors
        }
      }

      return {
        index: idx,
        rowNumber: row.rowNumber,
        rowType: row?.constructor?.name,
        columns,
      };
    });

    return NextResponse.json({
      totalRows: rows.length,
      sheetName: sheet.title,
      headerRowIndex: SHEET_CONFIG.HEADER_ROW,
      dataRange: SHEET_CONFIG.DATA_RANGE,
      sampleRows,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[ERROR] Debug endpoint error:', errorMsg);
    console.error('[ERROR] Stack:', error instanceof Error ? error.stack : '');
    return NextResponse.json(
      {
        error: 'Debug failed',
        details: errorMsg,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
