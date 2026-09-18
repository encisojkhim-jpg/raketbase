const { supabase, supabaseAdmin } = require('../config/supabase');

// POST /api/v1/auth/register
async function register(req, res) {
  const { firstName, lastName, email, password, role } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ status: 400, message: 'Invalid email address format' });
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      status: 400,
      message: 'Password must be at least 8 characters long, contain 1 uppercase letter and 1 number',
    });
  }

  const allowedRoles = ['customer', 'freelancer'];
  const requestedRole = role || 'customer';
  if (!allowedRoles.includes(requestedRole)) {
    return res.status(400).json({ status: 400, message: 'Role must be customer or freelancer' });
  }

  // NOTE: public.users.role is constrained to ('customer' | 'staff' | 'admin') in the DB schema.
  // 'freelancer' is only a valid value for active_role, not role. Passing the raw
  // registration choice straight into `role` will violate that CHECK constraint and
  // silently break freelancer signups (auth user gets created, profile row does not).
  const requestedActiveRole = requestedRole === 'freelancer' ? 'freelancer' : 'customer';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        first_name: firstName, 
        last_name: lastName, 
        role: 'customer',
        active_role: requestedActiveRole,
      },
    },
  });

  if (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }

  return res.status(201).json({ message: 'Registration successful!' });
}

// POST /api/v1/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 400, message: 'email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ status: 401, message: error.message });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('user_id, email, first_name, last_name, role, active_role, status, bio, skills, portfolio_url')
    .eq('user_id', data.user.id)
    .single();

  if (profileError || !profile) {
    console.error('Login succeeded but no matching public.users row was found for', data.user.id, profileError);
    return res.status(500).json({
      status: 500,
      message: 'Your account is missing a profile record. Please contact support or re-register.',
    });
  }

  if (profile.status === 'suspended') {
    return res.status(403).json({
      status: 403,
      message: 'This account has been suspended. Please contact support.',
    });
  }

  return res.status(200).json({
    token: data.session.access_token,
    user: profile,
  });
}

// PATCH /api/v1/auth/switch-role (Member 1)
async function switchRole(req, res) {
  const { new_role } = req.body;

  if (!['customer', 'freelancer'].includes(new_role)) {
    return res.status(400).json({ status: 400, message: 'Role must be customer or freelancer' });
  }

  const { data: profile, error } = await supabaseAdmin
    .from('users')
    .update({ active_role: new_role })
    .eq('user_id', req.user.id)
    .select('user_id, email, role, active_role, first_name, last_name')
    .single();

  if (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }

  return res.status(200).json({ message: 'Active role updated', user: profile });
}

// GET /api/v1/auth/profile (Member 1)
async function getProfile(req, res) {
  const { data: profile, error } = await supabaseAdmin
    .from('users')
    .select('user_id, email, first_name, last_name, role, active_role, bio, skills, portfolio_url')
    .eq('user_id', req.user.id)
    .single();

  if (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }

  return res.status(200).json({ success: true, data: profile });
}

// PUT /api/v1/auth/profile (Member 1)
async function updateProfile(req, res) {
  const { bio, skills, portfolio_url } = req.body;

  if (bio && bio.length > 500) {
    return res.status(400).json({ status: 400, message: 'Bio must be 500 characters or less' });
  }

  const { data: updated, error } = await supabaseAdmin
    .from('users')
    .update({ bio, skills, portfolio_url })
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }

  return res.status(200).json({ message: 'Profile updated successfully', data: updated });
}

module.exports = { register, login, switchRole, getProfile, updateProfile };