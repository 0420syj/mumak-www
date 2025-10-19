import { getSheetInfo } from '@/lib/google-sheets';
import { NextResponse } from 'next/server';

/**
 * DEBUG ONLY: 시트 구조 확인용
 */
export async function GET() {
  try {
    const sheetInfo = await getSheetInfo();

    return NextResponse.json({
      spreadsheet: sheetInfo.title,
      spreadsheetId: sheetInfo.spreadsheetId,
      sheets: sheetInfo.sheets,
      userSheets: sheetInfo.userSheets,
      message: `User1 시트명: ${sheetInfo.userSheets.User1}, User2 시트명: ${sheetInfo.userSheets.User2}`,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Failed to get sheet info',
        details: errorMsg,
      },
      { status: 500 }
    );
  }
}
