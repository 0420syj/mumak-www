import { auth } from '@/lib/auth';
import { getUserSheet } from '@/lib/google-sheets';
import { NextResponse } from 'next/server';

const SHEET_CONFIG = {
  HEADER_ROW: 1,
  DATA_START_COLUMN: 'A',
  get DATA_RANGE() {
    return `${this.DATA_START_COLUMN}${this.HEADER_ROW}`;
  },
};

/**
 * DEBUG ONLY: 첫 몇 개 행의 실제 데이터 구조 확인
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // User1 시트에서 샘플 데이터 조회
    const sheet = await getUserSheet('User1');
    console.log('[DEBUG] Getting sample rows...');

    // @ts-expect-error - range is a valid option in google-spreadsheet
    const rows = await sheet.getRows({ range: SHEET_CONFIG.DATA_RANGE });

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        error: 'No rows found',
      });
    }

    // 첫 3개 행만 상세하게 보여주기
    const sampleRows = rows.slice(1, 4).map((row, idx) => {
      const rowObj: Record<string, string | undefined> = {};

      // 모든 컬럼을 순회하면서 데이터 추출 (A~H)
      for (let i = 0; i < 8; i++) {
        const col = String.fromCharCode(65 + i); // A=65
        const value = row.get(col);
        rowObj[col] = value;
      }

      // 직접 알려진 필드명으로도 시도
      return {
        index: idx,
        allColumns: rowObj,
        knownFields: {
          date: row.get('date'),
          content: row.get('content'),
          amount: row.get('amount'),
          category: row.get('category'),
          paymentMethod: row.get('paymentMethod'),
          location: row.get('location'),
          description: row.get('description'),
        },
      };
    });

    return NextResponse.json({
      totalRows: rows.length,
      sheetName: sheet.title,
      headerRowIndex: SHEET_CONFIG.HEADER_ROW,
      sampleRows,
      hint: '각 row의 컬럼 데이터를 확인하세요. allColumns은 A~H 컬럼의 실제 값입니다.',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[ERROR] Debug endpoint error:', errorMsg);
    return NextResponse.json(
      {
        error: 'Debug failed',
        details: errorMsg,
      },
      { status: 500 }
    );
  }
}
