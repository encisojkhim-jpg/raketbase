const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export function registerUser({ firstName, lastName, email, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
}

export function loginUser({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
