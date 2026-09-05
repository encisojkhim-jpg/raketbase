const { supabase } = require('../config/supabase');

async function register(req, res) {
  const { firstName, lastName, email, password } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      status: 400,
      message: 'firstName, lastName, email, and password are required',
    });
  }
  if (password.length < 6) {
    return res.status(400).json({ status: 400, message: 'Password must be at least 6 characters' });
  }
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, role: 'customer' },
    },
  });

  if (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }

  return res.status(201).json({ message: 'Registration successful!' });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 400, message: 'email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ status: 401, message: error.message });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('user_id, email, first_name, last_name, role')
    .eq('user_id', data.user.id)
    .single();

  return res.status(200).json({
    token: data.session.access_token,
    user: profile,
  });
}

module.exports = { register, login };
