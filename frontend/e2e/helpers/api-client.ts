const API_URL = 'http://localhost:3333';

interface AuthResponse {
  accessToken: string;
  user: { id: string; name: string; email: string };
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  label: string,
  retries = 3,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, init);
    if (res.status === 429 && attempt < retries) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) throw new Error(`${label} failed: ${res.status} ${await res.text()}`);
    return res;
  }
  throw new Error(`${label} failed after ${retries} retries`);
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetchWithRetry(
    `${API_URL}/auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    },
    'Register',
  );
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetchWithRetry(
    `${API_URL}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    },
    'Login',
  );
  return res.json();
}

export async function createList(token: string, name: string): Promise<{ id: string; name: string }> {
  const res = await fetchWithRetry(
    `${API_URL}/lists`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    },
    'Create list',
  );
  return res.json();
}

export async function createItem(
  token: string,
  listId: string,
  data: { kind: string; title: string; notes?: string },
): Promise<{ id: string; title: string }> {
  const res = await fetchWithRetry(
    `${API_URL}/lists/${listId}/items`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
    'Create item',
  );
  return res.json();
}

export async function createInvite(
  token: string,
  listId: string,
  email: string,
  role: 'EDITOR' | 'VIEWER' = 'EDITOR',
): Promise<{ id: string }> {
  const res = await fetchWithRetry(
    `${API_URL}/lists/${listId}/invites`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, role }),
    },
    'Create invite',
  );
  return res.json();
}
