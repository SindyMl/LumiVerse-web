const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

async function apiFetch(path: string, options?: RequestInit) {
  const url = `${BASE_URL}/api${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API Error ${res.status}: ${err}`);
  }
  return res.json();
}

export const api = {
  // Bible
  getSections: () => apiFetch('/sections'),
  getBooks: (sectionId?: string) => apiFetch(sectionId ? `/books?section_id=${sectionId}` : '/books'),
  getBook: (abbrev: string) => apiFetch(`/books/${abbrev}`),
  getChapter: (abbrev: string, num: number) => apiFetch(`/chapters/${abbrev}/${num}`),
  getDailyVerse: () => apiFetch('/verse/daily'),
  search: (q: string) => apiFetch(`/search?q=${encodeURIComponent(q)}`),

  // Auth
  createAnonymousUser: (name?: string) =>
    apiFetch('/auth/anonymous', { method: 'POST', body: JSON.stringify({ display_name: name || 'Anonymous' }) }),

  // Paths
  getPaths: (userId: string) => apiFetch(`/paths?user_id=${userId}`),
  createPath: (data: any) => apiFetch('/paths', { method: 'POST', body: JSON.stringify(data) }),
  updatePath: (id: string, data: any) => apiFetch(`/paths/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePath: (id: string) => apiFetch(`/paths/${id}`, { method: 'DELETE' }),

  // Notes
  getNotes: (userId: string) => apiFetch(`/notes?user_id=${userId}`),
  createNote: (data: any) => apiFetch('/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id: string, data: any) => apiFetch(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id: string) => apiFetch(`/notes/${id}`, { method: 'DELETE' }),

  // Highlights
  getHighlights: (userId: string) => apiFetch(`/highlights?user_id=${userId}`),
  createHighlight: (data: any) => apiFetch('/highlights', { method: 'POST', body: JSON.stringify(data) }),
  deleteHighlight: (id: string) => apiFetch(`/highlights/${id}`, { method: 'DELETE' }),
};
