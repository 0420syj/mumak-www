import { GoogleSpreadsheet } from 'google-spreadsheet';

import type { Transaction } from '@/types/transaction';

/**
 * Google Sheets 클라이언트
 * google-spreadsheet 라이브러리를 래핑하여 사용 편의성 향상
 */

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

  if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
    throw new Error(
      'Missing Google Sheets configuration. Check environment variables.'
    );
  }

  // @ts-ignore - google-spreadsheet v5 constructor
  const doc = new GoogleSpreadsheet(spreadsheetId, undefined, {
    client_email: serviceAccountEmail,
    private_key: privateKey,
  } as any);

  try {
    await doc.loadInfo();
    cachedDoc = doc;
    console.log(`✓ Google Sheets loaded: ${doc.title}`);
  } catch (error) {
    console.error('Failed to load Google Sheets:', error);
    throw new Error('Failed to initialize Google Sheets connection');
  }

  return doc;
}

/**
 * Transactions 시트 가져오기
 */
async function getTransactionsSheet() {
  const doc = await initializeSheet();
  const sheet = doc.sheetsByTitle['Transactions'];

  if (!sheet) {
    throw new Error('Transactions sheet not found in spreadsheet');
  }

  return sheet;
}

/**
 * 모든 거래 데이터 조회
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const sheet = await getTransactionsSheet();
    const rows = await sheet.getRows();

    if (!rows) {
      return [];
    }

    return rows.map((row, index) => rowToTransaction(row, index));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * 특정 사용자의 거래 데이터 조회
 */
export async function getUserTransactions(
  user: 'User1' | 'User2'
): Promise<Transaction[]> {
  try {
    const sheet = await getTransactionsSheet();
    const rows = await sheet.getRows();

    if (!rows) {
      return [];
    }

    return rows
      .filter((row) => row.get('user')?.trim() === user)
      .map((row, index) => rowToTransaction(row, index));
  } catch (error) {
    console.error(`Error fetching transactions for ${user}:`, error);
    throw error;
  }
}

/**
 * 날짜 범위로 거래 데이터 조회
 */
export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  try {
    const sheet = await getTransactionsSheet();
    const rows = await sheet.getRows();

    if (!rows) {
      return [];
    }

    return rows
      .filter((row) => {
        const date = row.get('date')?.trim() || '';
        return date >= startDate && date <= endDate;
      })
      .map((row, index) => rowToTransaction(row, index));
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    throw error;
  }
}

/**
 * 카테고리별 거래 조회
 */
export async function getTransactionsByCategory(
  category: string
): Promise<Transaction[]> {
  try {
    const sheet = await getTransactionsSheet();
    const rows = await sheet.getRows();

    if (!rows) {
      return [];
    }

    return rows
      .filter((row) => row.get('category')?.trim() === category)
      .map((row, index) => rowToTransaction(row, index));
  } catch (error) {
    console.error(`Error fetching transactions for category ${category}:`, error);
    throw error;
  }
}

/**
 * 거래 추가 (Phase 3에서 사용)
 */
export async function addTransaction(data: {
  date: string;
  user: 'User1' | 'User2';
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}): Promise<Transaction> {
  try {
    const sheet = await getTransactionsSheet();

    const newRow = await sheet.addRow({
      date: data.date,
      user: data.user,
      category: data.category,
      description: data.description,
      amount: data.amount.toString(),
      type: data.type,
    });

    return rowToTransaction(newRow, 0);
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
}

/**
 * Spreadsheet 행을 Transaction 객체로 변환
 */
function rowToTransaction(row: any, index: number): Transaction {
  const amount = parseFloat(row.get('amount')?.trim() || '0');
  const id = `${row.get('date')}-${index}`;

  return {
    id,
    date: row.get('date')?.trim() || '',
    user: (row.get('user')?.trim() as 'User1' | 'User2') || 'User1',
    category: row.get('category')?.trim() || '',
    description: row.get('description')?.trim() || '',
    amount: isNaN(amount) ? 0 : amount,
    type: (row.get('type')?.trim() as 'income' | 'expense') || 'expense',
  };
}

/**
 * 시트 정보 조회 (디버깅용)
 */
export async function getSheetInfo() {
  try {
    const doc = await initializeSheet();
    return {
      title: doc.title,
      spreadsheetId: doc.spreadsheetId,
      sheets: doc.sheetsByIndex.map((sheet) => ({
        title: sheet.title,
        index: sheet.index,
        rowCount: sheet.rowCount,
        columnCount: sheet.columnCount,
      })),
    };
  } catch (error) {
    console.error('Error getting sheet info:', error);
    throw error;
  }
}
