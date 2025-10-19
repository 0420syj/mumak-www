import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import type { Transaction } from '@/types/transaction';

/**
 * Google Sheets 클라이언트
 * google-spreadsheet 라이브러리를 래핑하여 사용 편의성 향상
 *
 * 시트 구조:
 * - SHEET_NAME_USER1: User1의 거래 데이터
 * - SHEET_NAME_USER2: User2의 거래 데이터
 */

/**
 * 시트 구성 설정
 * (변경 필요 시 여기서만 수정하면 됨)
 */
const SHEET_CONFIG = {
  HEADER_ROW: 1, // 헤더가 있는 행 번호 (1-based)
  DATA_START_COLUMN: 'A', // 데이터가 시작하는 컬럼
  DATA_START_ROW: 2, // 실제 데이터가 시작하는 행 (row 1은 헤더)
  get DATA_RANGE() {
    // 예: "A2" (row 1은 헤더, row 2부터 데이터)
    return `${this.DATA_START_COLUMN}${this.DATA_START_ROW}`;
  },
};

// 사용자별 시트 이름 매핑 (환경변수에서 가져옴)
function getUserSheetMap(): Record<'User1' | 'User2', string> {
  const user1Sheet = process.env.SHEET_NAME_USER1;
  const user2Sheet = process.env.SHEET_NAME_USER2;

  if (!user1Sheet || !user2Sheet) {
    throw new Error(
      'Missing sheet name configuration. Check environment variables: SHEET_NAME_USER1, SHEET_NAME_USER2'
    );
  }

  return {
    User1: user1Sheet,
    User2: user2Sheet,
  };
}

let cachedDoc: GoogleSpreadsheet | null = null;

/**
 * Google Sheets 문서 초기화
 */
async function initializeSheet(): Promise<GoogleSpreadsheet> {
  if (cachedDoc) {
    return cachedDoc;
  }

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.SPREADSHEET_ID;

  console.log('[DEBUG] Initializing Google Sheets...');
  console.log('[DEBUG] serviceAccountEmail:', serviceAccountEmail ? 'set' : 'MISSING');
  console.log('[DEBUG] privateKey:', privateKey ? `set (length: ${privateKey.length})` : 'MISSING');
  console.log('[DEBUG] spreadsheetId:', spreadsheetId ? 'set' : 'MISSING');

  if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
    const missing = [];
    if (!serviceAccountEmail) missing.push('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    if (!privateKey) missing.push('GOOGLE_PRIVATE_KEY');
    if (!spreadsheetId) missing.push('SPREADSHEET_ID');
    const errorMsg = `Missing Google Sheets configuration: ${missing.join(', ')}`;
    console.error('[ERROR]', errorMsg);
    throw new Error(errorMsg);
  }

  let doc: GoogleSpreadsheet;

  try {
    console.log('[DEBUG] Creating GoogleSpreadsheet instance...');

    // JWT 인증 설정
    const serviceAccountAuth = new JWT({
      email: serviceAccountEmail,
      key: privateKey.replace(/\\n/g, '\n'), // 이스케이프 문자열 처리
      scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
    });

    console.log('[DEBUG] JWT auth created');

    // GoogleSpreadsheet 인스턴스 생성
    doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);

    console.log('[DEBUG] Calling doc.loadInfo()...');
    await doc.loadInfo();
    cachedDoc = doc;
    console.log('[SUCCESS] Google Sheets loaded:', doc.title);
    console.log('[DEBUG] Available sheets:', doc.sheetsByIndex.map(s => s.title).join(', '));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('[ERROR] Failed to load Google Sheets');
    console.error('[ERROR] Message:', errorMsg);
    console.error('[ERROR] Stack:', errorStack);
    throw new Error(`Failed to initialize Google Sheets connection: ${errorMsg}`);
  }

  return doc;
}

/**
 * 사용자별 시트 가져오기
 */
export async function getUserSheet(user: 'User1' | 'User2') {
  const doc = await initializeSheet();
  const sheetMap = getUserSheetMap();
  const sheetName = sheetMap[user];
  const sheet = doc.sheetsByTitle[sheetName];

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found for ${user}`);
  }

  return sheet;
}

/**
 * 특정 사용자의 모든 거래 데이터 조회
 */
export async function getUserTransactions(user: 'User1' | 'User2'): Promise<Transaction[]> {
  try {
    const sheet = await getUserSheet(user);
    console.log(`[DEBUG] Sheet "${sheet.title}" found`);

    // row 6을 헤더로 사용하기 위해 range를 지정
    // @ts-expect-error - range is a valid option in google-spreadsheet
    const rows = await sheet.getRows({ range: SHEET_CONFIG.DATA_RANGE });
    console.log(`[DEBUG] Got ${rows?.length || 0} rows from sheet`);

    if (!rows || rows.length === 0) {
      console.log(`[DEBUG] No rows found in sheet`);
      return [];
    }

    return rows.map((row, index) => rowToTransaction(row, index, user));
  } catch (error) {
    console.error(`Error fetching transactions for ${user}:`, error);
    throw error;
  }
}

/**
 * 모든 거래 데이터 조회 (User1과 User2 모두)
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const user1Transactions = await getUserTransactions('User1');
    const user2Transactions = await getUserTransactions('User2');
    return [...user1Transactions, ...user2Transactions];
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    throw error;
  }
}

/**
 * 날짜 범위로 거래 데이터 조회
 */
export async function getTransactionsByDateRange(
  user: 'User1' | 'User2',
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  try {
    const sheet = await getUserSheet(user);
    // @ts-expect-error - range is a valid option in google-spreadsheet
    const rows = await sheet.getRows({ range: SHEET_CONFIG.DATA_RANGE });

    if (!rows) {
      return [];
    }

    return rows
      .filter(row => {
        const date = row.get('date')?.trim() || '';
        return date >= startDate && date <= endDate;
      })
      .map((row, index) => rowToTransaction(row, index, user));
  } catch (error) {
    console.error(`Error fetching transactions by date range for ${user}:`, error);
    throw error;
  }
}

/**
 * 카테고리별 거래 조회
 */
export async function getTransactionsByCategory(user: 'User1' | 'User2', category: string): Promise<Transaction[]> {
  try {
    const sheet = await getUserSheet(user);
    // @ts-expect-error - range is a valid option in google-spreadsheet
    const rows = await sheet.getRows({ range: SHEET_CONFIG.DATA_RANGE });

    if (!rows) {
      return [];
    }

    return rows
      .filter(row => row.get('category')?.trim() === category)
      .map((row, index) => rowToTransaction(row, index, user));
  } catch (error) {
    console.error(`Error fetching transactions for category ${category}:`, error);
    throw error;
  }
}

/**
 * 거래 추가 (Phase 3에서 사용)
 */
export async function addTransaction(
  user: 'User1' | 'User2',
  data: {
    date: string;
    category: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
  }
): Promise<Transaction> {
  try {
    const sheet = await getUserSheet(user);

    const newRow = await sheet.addRow({
      date: data.date,
      category: data.category,
      description: data.description,
      amount: data.amount.toString(),
      type: data.type,
    });

    return rowToTransaction(newRow, 0, user);
  } catch (error) {
    console.error(`Error adding transaction for ${user}:`, error);
    throw error;
  }
}

/**
 * 날짜 문자열 정규화 (예: "2022. 5. 24" → "2022-05-24")
 */
function normalizeDateString(dateStr: string): string {
  try {
    // "2022. 5. 24" 형식을 "2022-05-24"로 변환
    const matches = dateStr.match(/(\d{4})\.\s+(\d{1,2})\.\s+(\d{1,2})/);
    if (!matches || !matches[1] || !matches[2] || !matches[3]) return dateStr;

    const year = matches[1];
    const month = matches[2].padStart(2, '0');
    const day = matches[3].padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * 금액 문자열 파싱 (예: "W660,000" → 660000)
 */
function parseAmountString(amountStr: string): number {
  try {
    // "W660,000" → "660000" → 660000
    const cleaned = amountStr.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
  } catch {
    return 0;
  }
}

/**
 * 카테고리에서 이모지 제거 (예: "🍕 음식" → "음식")
 */
function cleanCategory(categoryStr: string): string {
  try {
    // 이모지 및 특수 문자 제거, 앞뒤 공백 제거
    return categoryStr.replace(/[\p{Emoji}]/gu, '').trim();
  } catch {
    return categoryStr.trim();
  }
}

/**
 * Spreadsheet 행을 Transaction 객체로 변환
 *
 * 컬럼 매핑 (한글 헤더):
 * - A: 날짜
 * - B: 내용
 * - C: 금액
 * - D: 카테고리
 * - E: 결제수단
 * - F: 비고 (구매처)
 * - G: 참고사항
 */
function rowToTransaction(
  row: { get: (field: string) => string | undefined },
  index: number,
  user: 'User1' | 'User2'
): Transaction {
  const dateStr = row.get('날짜')?.trim() || '';
  const contentStr = row.get('내용')?.trim() || ''; // 내용 (미사용, B열)
  const amountStr = row.get('금액')?.trim() || '0';
  const categoryStr = row.get('카테고리')?.trim() || '';
  const paymentMethodStr = row.get('결제수단')?.trim() || '';
  const locationStr = row.get('비고')?.trim() || '';
  const descriptionStr = row.get('참고사항')?.trim() || '';

  const id = `${user}-${dateStr}-${index}`;
  const normalizedDate = normalizeDateString(dateStr);
  const amount = parseAmountString(amountStr);
  const cleanedCategory = cleanCategory(categoryStr);

  return {
    id,
    date: normalizedDate,
    user,
    category: cleanedCategory,
    description: descriptionStr,
    amount,
    type: 'expense', // 현재 모든 거래는 지출
    paymentMethod: paymentMethodStr,
    location: locationStr,
  };
}

/**
 * 시트 정보 조회 (디버깅용)
 */
export async function getSheetInfo() {
  try {
    const doc = await initializeSheet();
    const sheetMap = getUserSheetMap();
    return {
      doc, // doc 객체 추가
      title: doc.title,
      spreadsheetId: doc.spreadsheetId,
      sheets: doc.sheetsByIndex.map(sheet => ({
        title: sheet.title,
        index: sheet.index,
        rowCount: sheet.rowCount,
        columnCount: sheet.columnCount,
      })),
      userSheets: sheetMap,
    };
  } catch (error) {
    console.error('Error getting sheet info:', error);
    throw error;
  }
}
