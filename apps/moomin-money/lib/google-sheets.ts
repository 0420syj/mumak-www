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
    // @ts-expect-error - google-spreadsheet v5 constructor signature
    doc = new GoogleSpreadsheet(spreadsheetId, undefined, {
      client_email: serviceAccountEmail,
      private_key: privateKey,
    });

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
async function getUserSheet(user: 'User1' | 'User2') {
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
    const rows = await sheet.getRows();

    if (!rows) {
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
    const rows = await sheet.getRows();

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
    const rows = await sheet.getRows();

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
 * 컬럼 매핑:
 * - B: date
 * - C: description (내용)
 * - D: amount (금액)
 * - E: category
 * - F: paymentMethod (결제수단)
 * - G: location (비고/구매처)
 * - H: description (참고사항) - 우선순위
 */
function rowToTransaction(
  row: { get: (field: string) => string | undefined },
  index: number,
  user: 'User1' | 'User2'
): Transaction {
  const dateStr = row.get('date')?.trim() || '';
  const categoryStr = row.get('category')?.trim() || '';
  const amountStr = row.get('amount')?.trim() || '0';
  const paymentMethodStr = row.get('paymentMethod')?.trim() || '';
  const locationStr = row.get('location')?.trim() || '';
  const descriptionStr = row.get('description')?.trim() || '';

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
