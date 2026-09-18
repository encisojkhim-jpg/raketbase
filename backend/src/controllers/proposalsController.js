const { supabaseAdmin } = require('../config/supabase');

// POST /api/v1/proposals - Submit a proposal for a job
exports.createProposal = async (req, res) => {
  try {
    const { job_id, bid_amount, cover_letter } = req.body;
    // req.user is appended by JWT auth middleware
    const freelancer_id = req.user.id;

    if (!job_id || !bid_amount || !cover_letter) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: job_id, bid_amount, and cover_letter'
      });
    }

    const { data: proposal, error } = await supabaseAdmin
      .from('proposals')
      .insert([
        {
          job_id,
          freelancer_id,
          bid_amount,
          cover_letter,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data: proposal });
  } catch (error) {
    // Catch Postgres error code 23505 (unique violation on job_id + freelancer_id)
    if (
      error.code === '23505' ||
      error.message?.includes('proposals_job_id_freelancer_id_key') ||
      error.message?.toLowerCase().includes('duplicate key')
    ) {
      return res.status(409).json({
        success: false,
        error: 'You have already submitted a proposal for this job.'
      });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/v1/proposals/me - Get proposals submitted by the logged-in freelancer
exports.getMyProposals = async (req, res) => {
  try {
    const freelancer_id = req.user.id;

    const { data: proposals, error } = await supabaseAdmin
      .from('proposals')
      .select('*, jobs(title, budget, status)')
      .eq('freelancer_id', freelancer_id)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, data: proposals });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/v1/jobs/:id/proposals - Get all proposals for a job (client-only, must own the job)
exports.getProposalsForJob = async (req, res) => {
  try {
    const { id: job_id } = req.params;
    const client_id = req.user.id;

    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('job_id, client_id, title, budget, status')
      .eq('job_id', job_id)
      .single();

    if (jobError || !job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    if (job.client_id !== client_id) {
      return res.status(403).json({ success: false, error: 'You do not own this job posting' });
    }

    const { data: proposals, error } = await supabaseAdmin
      .from('proposals')
      .select('*, users!proposals_freelancer_id_fkey(first_name, last_name, email, bio, skills, portfolio_url)')
      .eq('job_id', job_id)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, data: { job, proposals } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/v1/proposals/:id/accept - Accept a proposal (client-only, must own the job).
// Rejects other pending proposals on the same job and moves the job to 'assigned'.
exports.acceptProposal = async (req, res) => {
  try {
    const { id: proposal_id } = req.params;
    const client_id = req.user.id;

    const { data: proposal, error: proposalError } = await supabaseAdmin
      .from('proposals')
      .select('*, jobs(job_id, client_id, status)')
      .eq('proposal_id', proposal_id)
      .single();

    if (proposalError || !proposal) {
      return res.status(404).json({ success: false, error: 'Proposal not found' });
    }
    if (proposal.jobs.client_id !== client_id) {
      return res.status(403).json({ success: false, error: 'You do not own the job for this proposal' });
    }
    if (proposal.jobs.status !== 'open') {
      return res.status(409).json({ success: false, error: 'This job is no longer open for proposals' });
    }
    if (proposal.status !== 'pending') {
      return res.status(409).json({ success: false, error: 'This proposal has already been decided' });
    }

    const { data: accepted, error: acceptError } = await supabaseAdmin
      .from('proposals')
      .update({ status: 'accepted' })
      .eq('proposal_id', proposal_id)
      .select()
      .single();

    if (acceptError) throw acceptError;

    // Auto-reject every other still-pending proposal on this job.
    const { error: rejectOthersError } = await supabaseAdmin
      .from('proposals')
      .update({ status: 'rejected' })
      .eq('job_id', proposal.job_id)
      .eq('status', 'pending')
      .neq('proposal_id', proposal_id);

    if (rejectOthersError) throw rejectOthersError;

    const { error: jobUpdateError } = await supabaseAdmin
      .from('jobs')
      .update({ status: 'assigned' })
      .eq('job_id', proposal.job_id);

    if (jobUpdateError) throw jobUpdateError;

    return res.status(200).json({ success: true, data: accepted });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/v1/proposals/:id/reject - Reject a single proposal (client-only, must own the job)
exports.rejectProposal = async (req, res) => {
  try {
    const { id: proposal_id } = req.params;
    const client_id = req.user.id;

    const { data: proposal, error: proposalError } = await supabaseAdmin
      .from('proposals')
      .select('*, jobs(job_id, client_id)')
      .eq('proposal_id', proposal_id)
      .single();

    if (proposalError || !proposal) {
      return res.status(404).json({ success: false, error: 'Proposal not found' });
    }
    if (proposal.jobs.client_id !== client_id) {
      return res.status(403).json({ success: false, error: 'You do not own the job for this proposal' });
    }
    if (proposal.status !== 'pending') {
      return res.status(409).json({ success: false, error: 'This proposal has already been decided' });
    }

    const { data: rejected, error } = await supabaseAdmin
      .from('proposals')
      .update({ status: 'rejected' })
      .eq('proposal_id', proposal_id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data: rejected });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
