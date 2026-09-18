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
// Atomically accepts proposal, auto-rejects other pending proposals on the job,
// moves the job to 'assigned', and creates an active contract in public.contracts via PostgreSQL RPC.
exports.acceptProposal = async (req, res) => {
  try {
    const { id: proposal_id } = req.params;
    const client_id = req.user.id;

    const { data: contract, error: rpcError } = await supabaseAdmin.rpc(
      'accept_proposal_and_create_contract',
      {
        p_proposal_id: proposal_id,
        p_client_id: client_id,
      }
    );

    if (rpcError) {
      const msg = rpcError.message || 'Failed to accept proposal';
      if (msg.includes('Proposal not found') || msg.includes('Job not found')) {
        return res.status(404).json({ success: false, error: msg });
      }
      if (msg.includes('Unauthorized')) {
        return res.status(403).json({ success: false, error: msg });
      }
      if (msg.includes('already') || msg.includes('no longer open')) {
        return res.status(409).json({ success: false, error: msg });
      }
      return res.status(500).json({ success: false, error: msg });
    }

    return res.status(200).json({
      success: true,
      message: 'Proposal accepted and contract initiated.',
      data: contract,
    });
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
