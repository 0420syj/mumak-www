import { auth } from '@/lib/auth';
import { getUserTransactions } from '@/lib/google-sheets';
import type { TransactionsResponse } from '@/types/transaction';
import { NextResponse } from 'next/server';

/**
 * GET /api/transactions
 * 인증된 사용자의 거래 데이터 조회
 * 쿼리: ?user=User1 또는 ?user=User2 (기본값: 현재 사용자)
 */
export async function GET(request: Request) {
  try {
    console.log('[DEBUG] GET /api/transactions called');

    // 세션 확인
    const session = await auth();
    console.log('[DEBUG] Session:', session?.user?.email);

    if (!session?.user?.email) {
      console.log('[DEBUG] No email in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자 결정 (이메일 기반)
    const allowedEmail1 = process.env.ALLOWED_EMAIL_1;
    const allowedEmail2 = process.env.ALLOWED_EMAIL_2;

    console.log('[DEBUG] Checking email:', session.user.email);
    console.log('[DEBUG] allowedEmail1:', allowedEmail1);
    console.log('[DEBUG] allowedEmail2:', allowedEmail2);

    let currentUser: 'User1' | 'User2';

    if (session.user.email === allowedEmail1) {
      currentUser = 'User1';
    } else if (session.user.email === allowedEmail2) {
      currentUser = 'User2';
    } else {
      console.log('[DEBUG] Email not recognized');
      return NextResponse.json({ error: 'User email not recognized' }, { status: 403 });
    }

    console.log('[DEBUG] Current user:', currentUser);

    // 쿼리 파라미터로 어떤 사용자의 데이터를 볼지 결정
    const { searchParams } = new URL(request.url);
    const viewUser = (searchParams.get('user') as 'User1' | 'User2') || currentUser;

    console.log('[DEBUG] View user:', viewUser);
    console.log('[DEBUG] Calling getUserTransactions...');

    // 거래 데이터 조회 (사용자별 시트에서)
    const transactions = await getUserTransactions(viewUser);

    console.log('[DEBUG] Got transactions:', transactions.length);

    const response: TransactionsResponse = {
      transactions,
      total: transactions.length,
      owner: viewUser,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[ERROR] Error in GET /api/transactions:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('[ERROR] Stack:', errorStack);

    return NextResponse.json(
      {
        error: 'Failed to fetch transactions',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
