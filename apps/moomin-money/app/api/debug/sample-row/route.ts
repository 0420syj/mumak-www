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

    // 첫 3개 행의 데이터 상세히 확인
    const sampleRows = rows.slice(0, 3).map((row, idx) => {
      // row 객체의 모든 키 확인
      const rowKeys = Object.keys(row).filter(key => !key.startsWith('_'));

      // 직접 JSON으로 변환 시도
      const rowJson: Record<string, unknown> = {};
      rowKeys.forEach(key => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rowJson[key] = (row as any)[key];
        } catch {
          // skip
        }
      });

      return {
        index: idx,
        rowNumber: row.rowNumber,
        availableKeys: rowKeys,
        rowData: rowJson,
        // 각 행의 전체 내용 시도
        fullRow: {
          A: row.get('A') || row.get('1'),
          B: row.get('B') || row.get('2'),
          C: row.get('C') || row.get('3'),
          D: row.get('D') || row.get('4'),
          E: row.get('E') || row.get('5'),
          F: row.get('F') || row.get('6'),
          G: row.get('G') || row.get('7'),
          H: row.get('H') || row.get('8'),
        },
      };
    });

    return NextResponse.json({
      totalRows: rows.length,
      sheetName: sheet.title,
      headerRowIndex: SHEET_CONFIG.HEADER_ROW,
      dataRange: SHEET_CONFIG.DATA_RANGE,
      sampleRows,
      hint: 'availableKeys에서 실제 컬럼명을 확인하고, fullRow에서 데이터 위치를 확인하세요.',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[ERROR] Debug endpoint error:', errorMsg);
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
