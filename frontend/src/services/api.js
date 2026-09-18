const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }

  return data;
}

// Authentication & Profile API
export function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function switchRole(new_role) {
  return request('/auth/switch-role', {
    method: 'PATCH',
    body: JSON.stringify({ new_role }),
  });
}

export function getProfile() {
  return request('/auth/profile');
}

export function updateProfile(payload) {
  return request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// Jobs API
export function getJobs(categoryId) {
  const query = categoryId ? `?category_id=${categoryId}` : '';
  return request(`/jobs${query}`);
}

export function getCategories() {
  return request('/jobs/categories');
}

export function getJobById(id) {
  return request(`/jobs/${id}`);
}

export function createJob(payload) {
  return request('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMyJobs() {
  return request('/jobs/mine');
}

export function getJobProposals(jobId) {
  return request(`/jobs/${jobId}/proposals`);
}

// Proposal API
export function submitProposal(payload) {
  return request('/proposals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMyProposals() {
  return request('/proposals/me');
}

export function acceptProposal(proposalId) {
  return request(`/proposals/${proposalId}/accept`, { method: 'PATCH' });
}

export function rejectProposal(proposalId) {
  return request(`/proposals/${proposalId}/reject`, { method: 'PATCH' });
}

// Contract Execution & Escrow API (Part 3)
export function getContracts() {
  return request('/contracts');
}

export function getContractById(contractId) {
  return request(`/contracts/${contractId}`);
}

export function submitContractWork(contractId) {
  return request(`/contracts/${contractId}/submit`, { method: 'PATCH' });
}

export function completeContract(contractId) {
  return request(`/contracts/${contractId}/complete`, { method: 'PATCH' });
}