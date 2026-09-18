const { supabaseAdmin } = require('../config/supabase');

// GET /api/v1/admin/analytics - Platform-wide metrics for the admin dashboard
exports.getAnalytics = async (req, res) => {
  try {
    const [
      { count: totalUsers, error: usersError },
      { count: activeContracts, error: contractsError },
      { data: completedContracts, error: revenueError },
      { count: openDisputes, error: disputesError },
    ] = await Promise.all([
      supabaseAdmin.from('users').select('user_id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('contracts')
        .select('contract_id', { count: 'exact', head: true })
        .in('status', ['active', 'submitted']),
      supabaseAdmin.from('contracts').select('agreed_amount').eq('status', 'completed'),
      supabaseAdmin
        .from('disputes')
        .select('dispute_id', { count: 'exact', head: true })
        .in('status', ['open', 'under_review']),
    ]);

    if (usersError) throw usersError;
    if (contractsError) throw contractsError;
    if (revenueError) throw revenueError;
    if (disputesError) throw disputesError;

    const platformRevenue = (completedContracts || []).reduce(
      (sum, c) => sum + Number(c.agreed_amount || 0),
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        total_users: totalUsers || 0,
        active_contracts: activeContracts || 0,
        platform_revenue: platformRevenue,
        open_disputes: openDisputes || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/v1/admin/users - List users for the management table
exports.getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('user_id, email, first_name, last_name, role, active_role, status, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, data: users || [] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/v1/admin/users/:id - Toggle a user's active/suspended status
// REQUIRES MIGRATION: public.users needs a `status` column before this will work.
// ALTER TABLE public.users ADD COLUMN status text DEFAULT 'active'
//   CHECK (status = ANY (ARRAY['active'::text, 'suspended'::text]));
exports.updateUserStatus = async (req, res) => {
  try {
    const { id: user_id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, error: "status must be 'active' or 'suspended'" });
    }

    if (user_id === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot change your own account status' });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('users')
      .update({ status })
      .eq('user_id', user_id)
      .select('user_id, email, status')
      .single();

    if (error) throw error;
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
