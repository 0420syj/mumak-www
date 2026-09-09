import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AdminSession } from '../admin-session';

jest.mock('../image-upload-form', () => ({
  ImageUploadForm: ({ onSessionExpired }: { onSessionExpired: () => void }) => (
    <button onClick={onSessionExpired}>expire session</button>
  ),
}));
afterEach(() => {
  jest.restoreAllMocks();
  Reflect.deleteProperty(global, 'fetch');
});
it('logs in once, clears the token input and logs out', async () => {
  const user = userEvent.setup();
  const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
  Object.defineProperty(global, 'fetch', { configurable: true, value: fetchSpy });
  render(<AdminSession initialAuthenticated={false} />);
  expect(screen.getByRole('button', { name: '로그인' })).toBeDisabled();
  await user.type(screen.getByLabelText('업로드 토큰'), 'test-token');
  await user.click(screen.getByRole('button', { name: '로그인' }));
  expect(await screen.findByText('로그인됨')).toBeInTheDocument();
  expect(screen.queryByLabelText('업로드 토큰')).not.toBeInTheDocument();
  expect(fetchSpy).toHaveBeenCalledWith('/api/session', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { Authorization: 'Bearer test-token' },
  });
  await user.click(screen.getByRole('button', { name: '로그아웃' }));
  expect(await screen.findByLabelText('업로드 토큰')).toHaveValue('');
  expect(fetchSpy).toHaveBeenLastCalledWith('/api/session', { method: 'DELETE', credentials: 'same-origin' });
});
it('returns expired sessions to login', async () => {
  const user = userEvent.setup();
  render(<AdminSession initialAuthenticated />);
  await user.click(screen.getByRole('button', { name: 'expire session' }));
  expect(screen.getByText('로그인이 만료되었습니다. 다시 로그인하세요.')).toBeInTheDocument();
  expect(screen.getByLabelText('업로드 토큰')).toHaveValue('');
});
it.each([401, 503])('keeps login visible when authentication fails with %s', async status => {
  const user = userEvent.setup();
  Object.defineProperty(global, 'fetch', {
    configurable: true,
    value: jest.fn().mockResolvedValue({ ok: false, status }),
  });
  render(<AdminSession initialAuthenticated={false} />);
  await user.type(screen.getByLabelText('업로드 토큰'), 'wrong');
  await user.click(screen.getByRole('button', { name: '로그인' }));
  expect(
    await screen.findByText(status === 401 ? '토큰이 올바르지 않습니다.' : '로그인하지 못했습니다. 다시 시도하세요.')
  ).toBeInTheDocument();
  expect(screen.queryByText('로그인됨')).not.toBeInTheDocument();
});
it('keeps the current session visible when logout fails', async () => {
  const user = userEvent.setup();
  Object.defineProperty(global, 'fetch', { configurable: true, value: jest.fn().mockResolvedValue({ ok: false }) });
  render(<AdminSession initialAuthenticated />);
  await user.click(screen.getByRole('button', { name: '로그아웃' }));
  expect(await screen.findByText('로그아웃하지 못했습니다. 다시 시도하세요.')).toBeInTheDocument();
  expect(screen.getByText('로그인됨')).toBeInTheDocument();
});
