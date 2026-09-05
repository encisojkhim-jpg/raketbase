const { supabase } = require('../config/supabase');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ status: 401, message: 'Missing Authorization header' });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ status: 401, message: 'Invalid or expired token' });
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role, first_name, last_name')
    .eq('user_id', userData.user.id)
    .single();

  if (profileError || !profile) {
    return res.status(401).json({ status: 401, message: 'User profile not found' });
  }

  req.user = {
    id: userData.user.id,
    email: userData.user.email,
    role: profile.role,
    firstName: profile.first_name,
    lastName: profile.last_name,
  };

  next();
}

module.exports = { requireAuth };
