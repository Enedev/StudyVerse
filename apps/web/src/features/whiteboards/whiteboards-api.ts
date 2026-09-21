import { apiFetch } from '@/lib/api/client';

import type { WhiteboardDetail, WhiteboardSummary } from './whiteboard-types';

export function listWhiteboards() {
  return apiFetch<WhiteboardSummary[]>('/whiteboards');
}

export function getWhiteboard(whiteboardId: string) {
  return apiFetch<WhiteboardDetail>(`/whiteboards/${whiteboardId}`);
}

export function createWhiteboard(title: string) {
  return apiFetch<WhiteboardDetail>('/whiteboards', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export function saveWhiteboard(
  whiteboardId: string,
  input: { title?: string; snapshot?: Record<string, unknown> },
) {
  return apiFetch<WhiteboardDetail | { id: string; saved: true }>(
    `/whiteboards/${whiteboardId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
}

export function deleteWhiteboard(whiteboardId: string) {
  return apiFetch<{ id: string }>(`/whiteboards/${whiteboardId}`, {
    method: 'DELETE',
  });
}

export function inviteWhiteboardMember(
  whiteboardId: string,
  email: string,
  role: 'viewer' | 'editor',
) {
  return apiFetch<WhiteboardDetail>(`/whiteboards/${whiteboardId}/members`, {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
}

export function removeWhiteboardMember(whiteboardId: string, memberId: string) {
  return apiFetch<WhiteboardDetail>(
    `/whiteboards/${whiteboardId}/members/${memberId}`,
    { method: 'DELETE' },
  );
}
