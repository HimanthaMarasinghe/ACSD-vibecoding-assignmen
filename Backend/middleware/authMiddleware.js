import { supabase } from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
  try {
    // 1. Get token from HttpOnly cookie FIRST, or fallback to Authorization header
    const token = 
      req.cookies?.ceyloncart_token || 
      (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Access token missing' });
    }

    // 2. Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authentication verification failed: ' + error.message });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    // req.user is guaranteed to exist by requireAuth
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ message: 'Forbidden: Profile record not found' });
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    req.user.role = profile.role;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Role verification failed: ' + error.message });
  }
};