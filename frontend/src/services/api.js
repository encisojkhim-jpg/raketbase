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

export function registerUser({ firstName, lastName, email, password, role }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, email, password, role }),
  });
}

export function loginUser({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Fetches all open jobs from the backend, optionally filtered by category
export function getJobs(categoryId) {
  const query = categoryId ? `?category_id=${categoryId}` : '';
  return request(`/jobs${query}`);
}

// Fetches a single job's full details (description, budget, client info) by its ID
export function getJobById(id) {
  return request(`/jobs/${id}`);
}

// Sends a freelancer's proposal (bid + cover letter) for a specific job — requires login token
export function submitProposal({ job_id, bid_amount, cover_letter }) {
  const token = localStorage.getItem('token');
  return request('/proposals', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ job_id, bid_amount, cover_letter }),
  });
}

// Gets all proposals the logged-in freelancer has submitted — requires login token
export function getMyProposals() {
  const token = localStorage.getItem('token');
  return request('/proposals/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
