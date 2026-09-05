const { supabase } = require('../config/supabase');

// GET /api/v1/jobs - Fetch all open jobs (with optional category filtering)
exports.getAllJobs = async (req, res) => {
  try {
    const { category_id } = req.query;

    let query = supabase
      .from('jobs')
      .select('*, categories(category_name)')
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

// GET /api/v1/jobs/:id - Fetch single job details by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: job, error } = await supabase
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