const supabase = require('../config/supabase');

// POST /api/v1/proposals - Submit a proposal for a job
exports.createProposal = async (req, res) => {
  try {
    const { job_id, bid_amount, cover_letter } = req.body;
    // req.user is appended by Member 2's JWT auth middleware
    const freelancer_id = req.user.user_id; 

    if (!job_id || !bid_amount || !cover_letter) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: job_id, bid_amount, and cover_letter'
      });
    }

    const { data: proposal, error } = await supabase
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
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/v1/proposals/me - Get proposals submitted by the logged-in freelancer
exports.getMyProposals = async (req, res) => {
  try {
    const freelancer_id = req.user.user_id;

    const { data: proposals, error } = await supabase
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