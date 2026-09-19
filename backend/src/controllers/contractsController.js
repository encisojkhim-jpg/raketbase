const { supabaseAdmin } = require('../config/supabase');

// GET /api/v1/contracts - Get all contracts for the authenticated user (as client or freelancer)
exports.getContracts = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: contracts, error } = await supabaseAdmin
      .from('contracts')
      .select(`
        contract_id,
        job_id,
        client_id,
        freelancer_id,
        agreed_amount,
        status,
        created_at,
        jobs (
          job_id,
          title,
          description,
          budget,
          status,
          budget_type
        ),
        reviews (
          review_id,
          reviewer_id,
          reviewee_id,
          rating
        ),
        client:users!contracts_client_id_fkey (
          user_id,
          first_name,
          last_name,
          email,
          active_role
        ),
        freelancer:users!contracts_freelancer_id_fkey (
          user_id,
          first_name,
          last_name,
          email,
          active_role,
          bio,
          skills,
          portfolio_url
        )
      `)
      .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, data: contracts || [] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/v1/contracts/:id - Get a specific contract by ID
exports.getContractById = async (req, res) => {
  try {
    const { id: contract_id } = req.params;
    const userId = req.user.id;

    const { data: contract, error } = await supabaseAdmin
      .from('contracts')
      .select(`
        contract_id,
        job_id,
        client_id,
        freelancer_id,
        agreed_amount,
        status,
        created_at,
        jobs (
          job_id,
          title,
          description,
          budget,
          status,
          budget_type
        ),
        reviews (
          review_id,
          reviewer_id,
          reviewee_id,
          rating
        ),
        client:users!contracts_client_id_fkey (
          user_id,
          first_name,
          last_name,
          email,
          active_role
        ),
        freelancer:users!contracts_freelancer_id_fkey (
          user_id,
          first_name,
          last_name,
          email,
          active_role,
          bio,
          skills,
          portfolio_url
        )
      `)
      .eq('contract_id', contract_id)
      .single();

    if (error || !contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    if (contract.client_id !== userId && contract.freelancer_id !== userId) {
      return res.status(403).json({ success: false, error: 'You are not a participant in this contract' });
    }

    return res.status(200).json({ success: true, data: contract });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/v1/contracts/:id/submit - Freelancer submits work for client review
exports.submitWork = async (req, res) => {
  try {
    const { id: contract_id } = req.params;
    const userId = req.user.id;

    // Submitting work is a freelancer-mode action. Clients must switch modes first.
    if (req.user.active_role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        error: 'Switch to Freelancer mode to submit work.'
      });
    }

    const { data: contract, error: fetchError } = await supabaseAdmin
      .from('contracts')
      .select('contract_id, client_id, freelancer_id, status')
      .eq('contract_id', contract_id)
      .single();

    if (fetchError || !contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    if (contract.freelancer_id !== userId) {
      return res.status(403).json({ success: false, error: 'Only the assigned freelancer can submit work' });
    }

    if (contract.status !== 'active') {
      return res.status(409).json({
        success: false,
        error: `Cannot submit work on a contract that is currently '${contract.status}'`,
      });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('contracts')
      .update({ status: 'submitted' })
      .eq('contract_id', contract_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      message: 'Work successfully submitted for client review and escrow release.',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/v1/contracts/:id/complete - Client approves work and releases escrow funds
exports.completeContract = async (req, res) => {
  try {
    const { id: contract_id } = req.params;
    const userId = req.user.id;

    // Approving work & releasing escrow is a client-mode action. Freelancers must switch modes first.
    if (req.user.active_role !== 'customer') {
      return res.status(403).json({
        success: false,
        error: 'Switch to Client mode to approve work and release escrow funds.'
      });
    }

    const { data: contract, error: fetchError } = await supabaseAdmin
      .from('contracts')
      .select('contract_id, job_id, client_id, freelancer_id, agreed_amount, status')
      .eq('contract_id', contract_id)
      .single();

    if (fetchError || !contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    if (contract.client_id !== userId) {
      return res.status(403).json({ success: false, error: 'Only the client can approve deliverables and release funds' });
    }

    if (contract.status !== 'submitted') {
      return res.status(409).json({
        success: false,
        error: `Cannot complete a contract in '${contract.status}' status. The freelancer must submit work for review first.`,
      });
    }

    // Update contract status to completed
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('contracts')
      .update({ status: 'completed' })
      .eq('contract_id', contract_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Also update associated job status to 'completed'
    if (contract.job_id) {
      await supabaseAdmin
        .from('jobs')
        .update({ status: 'completed' })
        .eq('job_id', contract.job_id);
    }

    return res.status(200).json({
      success: true,
      message: `Contract approved! ₱${Number(contract.agreed_amount).toLocaleString()} released to freelancer.`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
