const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  // For FormData (file uploads) the browser must set Content-Type itself so it can
  // include the multipart boundary — forcing application/json would break the upload.
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
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

// Profile photo (freelancer profile page)
export function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  return request('/auth/profile/avatar', { method: 'POST', body: formData });
}

export function removeAvatar() {
  return request('/auth/profile/avatar', { method: 'DELETE' });
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

export function withdrawProposal(proposalId) {
  return request(`/proposals/${proposalId}/withdraw`, { method: 'PATCH' });
}

// payload is optional — pass { bid_amount, cover_letter } to revise the
// proposal as part of restoring it, or omit to restore it unchanged.
export function unwithdrawProposal(proposalId, payload = {}) {
  return request(`/proposals/${proposalId}/unwithdraw`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
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

// Admin API (Part 4)
export function getAdminAnalytics() {
  return request('/admin/analytics');
}
 
export function getAdminUsers() {
  return request('/admin/users');
}
 
export function updateUserStatus(userId, status) {
  return request(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
 
// Disputes API (Part 4)
export function createDispute(payload) {
  return request('/disputes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
 
export function listDisputes() {
  return request('/disputes');
}
 
export function getDisputeById(disputeId) {
  return request(`/disputes/${disputeId}`);
}
 
export function resolveDispute(disputeId, payload) {
  return request(`/disputes/${disputeId}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// Ratings & Reviews API
// payload: { contract_id, rating, comment?, ...three sub-ratings for the reviewee's role }
export function createReview(payload) {
  return request('/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Public profile + ratings for one person in one role ('freelancer' | 'customer').
export function getUserReviews(userId, role) {
  return request(`/reviews/users/${userId}?role=${role}`);
}
