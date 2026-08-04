import { supabase } from '../config/supabase.js';

const COOKIE_OPTIONS = {
  httpOnly: true, // Prevents client-side JS from reading the cookie
  secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
  sameSite: 'none', // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || email.split('@')[0] }
      }
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const appRole = await getAppRole(data.user.id);

    // 3. Combine the Supabase user object with your app role
    const userWithAppRole = {
      ...data.user,
      appRole: appRole // e.g. 'admin' or 'user'
    };

    res.cookie('ceyloncart_token', data.session.access_token, COOKIE_OPTIONS);

    res.status(201).json({
      message: 'Account created successfully',
      user: userWithAppRole
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    const appRole = await getAppRole(data.user.id);

    // 3. Combine the Supabase user object with your app role
    const userWithAppRole = {
      ...data.user,
      appRole: appRole // e.g. 'admin' or 'user'
    };

    res.cookie('ceyloncart_token', data.session.access_token, COOKIE_OPTIONS);

    res.status(200).json({
      message: 'Login successful',
      user: userWithAppRole
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    await supabase.auth.signOut();
    res.clearCookie('ceyloncart_token', COOKIE_OPTIONS);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const token = 
      req.cookies?.ceyloncart_token || 
      (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    // 2. Validate session with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired session token' });
    }

    const appRole = await getAppRole(user.id);

    // 3. Optional: Attach role metadata for your frontend
    const userWithRole = {
      ...user,
      appRole: appRole || 'user',
    };

    return res.status(200).json({ user: userWithRole });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to authenticate user: ' + error.message });
  }
};

const getAppRole = async (userId) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error('Error fetching user role: ' + error.message);
    }

    return profile?.role || 'user'; // Default to 'user' if no role found
  } catch (error) {
    console.error(error);
    return 'user'; // Fallback to 'user' on error
  }
};
