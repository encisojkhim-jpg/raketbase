const { supabaseAdmin } = require('../config/supabase');

// GET /api/v1/jobs - Fetch all open jobs (with optional category filtering)
exports.getAllJobs = async (req, res) => {
  try {
    const { category_id } = req.query;

    let query = supabaseAdmin
      .from('jobs')
      .select('*, categories(category_name), users!jobs_client_id_fkey(first_name, last_name)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data: jobs, error } = await query;

    if (error) throw error;

    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/v1/jobs/categories - Fetch all categories (Member 2)
exports.getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*');

    if (error) throw error;

    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/v1/jobs/:id - Fetch single job details by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .select('*, categories(category_name), users!jobs_client_id_fkey(first_name, last_name, email)')
      .eq('job_id', id)
      .single();

    if (error || !job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/v1/jobs/mine - Fetch jobs posted by the logged-in client, with proposal counts
exports.getMyJobs = async (req, res) => {
  try {
    const client_id = req.user.id;

    const { data: jobs, error } = await supabaseAdmin
      .from('jobs')
      .select('*, categories(category_name), proposals(proposal_id, status)')
      .eq('client_id', client_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const withCounts = (jobs || []).map((job) => {
      const proposals = job.proposals || [];
      return {
        ...job,
        proposal_count: proposals.length,
        pending_count: proposals.filter((p) => p.status === 'pending').length,
      };
    });

    return res.status(200).json({ success: true, data: withCounts });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/v1/jobs - Create a new job posting (Member 2)
exports.createJob = async (req, res) => {
  try {
    if (req.user?.active_role !== 'customer') {
      return res.status(403).json({
        success: false,
        error: 'Only customers can create job postings.',
      });
    }

    const { title, description, category_id, budget_type, budget, deadline } = req.body;
    const client_id = req.user.id;

    if (!title || title.length < 10) {
      return res.status(400).json({ success: false, error: 'Title is required and must be at least 10 characters.' });
    }

    if (!category_id) {
      return res.status(400).json({ success: false, error: 'Category selection is required.' });
    }

    if (!budget || Number(budget) <= 0) {
      return res.status(400).json({ success: false, error: 'Budget must be a positive number greater than 0.' });
    }

    if (deadline && new Date(deadline).getTime() <= Date.now()) {
      return res.status(400).json({ success: false, error: 'Deadline must be a future date.' });
    }

    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .insert([
        {
          client_id,
          title,
          description,
          category_id,
          budget_type: budget_type || 'fixed',
          budget,
          deadline,
          status: 'open'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data: job });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};