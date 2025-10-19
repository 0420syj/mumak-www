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
    // 세션 확인
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자 결정 (이메일 기반)
    const allowedEmail1 = process.env.ALLOWED_EMAIL_1;
    const allowedEmail2 = process.env.ALLOWED_EMAIL_2;

    let currentUser: 'User1' | 'User2';

    if (session.user.email === allowedEmail1) {
      currentUser = 'User1';
    } else if (session.user.email === allowedEmail2) {
      currentUser = 'User2';
    } else {
      return NextResponse.json({ error: 'User email not recognized' }, { status: 403 });
    }

    // 쿼리 파라미터로 어떤 사용자의 데이터를 볼지 결정
    const { searchParams } = new URL(request.url);
    const viewUser = (searchParams.get('user') as 'User1' | 'User2') || currentUser;

    // 거래 데이터 조회 (사용자별 시트에서)
    const transactions = await getUserTransactions(viewUser);

    const response: TransactionsResponse = {
      transactions,
      total: transactions.length,
      owner: viewUser,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[ERROR] Failed to fetch transactions:', error instanceof Error ? error.message : String(error));

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch transactions',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
