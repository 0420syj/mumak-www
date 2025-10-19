/**
 * 사용자 식별 유틸리티
 */

/* eslint-disable turbo/no-undeclared-env-vars */

import type { UserId } from '@/types/domain';

/**
 * 이메일로부터 사용자 ID 식별
 * @param email 사용자 이메일
 * @returns UserId | null
 */
export function identifyUserByEmail(email: string): UserId | null {
  const allowedEmail1 = process.env.ALLOWED_EMAIL_1;
  const allowedEmail2 = process.env.ALLOWED_EMAIL_2;

  if (!allowedEmail1 || !allowedEmail2) {
    throw new Error('Missing email configuration in environment variables');
  }

  if (email === allowedEmail1) {
    return 'User1';
  }

  if (email === allowedEmail2) {
    return 'User2';
  }

  return null;
}

/**
 * 사용자 ID가 유효한지 확인
 */
export function isValidUser(user: unknown): user is UserId {
  return user === 'User1' || user === 'User2';
}
