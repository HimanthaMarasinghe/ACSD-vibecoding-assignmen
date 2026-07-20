import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase, isMockMode } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/db.json');

const getDb = () => {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

const saveDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export const getProfile = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!isMockMode) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ message: error.message });
      }

      if (data) {
        return res.json(data);
      }

      // If profile doesn't exist, create a default one
      const defaultName = email.split('@')[0];
      const newProfile = {
        email,
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        phone: '',
        address: '',
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
        bio: 'CeylonCart customer',
        created_at: new Date().toISOString()
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (insertError) {
        return res.status(500).json({ message: insertError.message });
      }

      return res.status(201).json(insertedData);
    }

    // Mock Mode
    const db = getDb();
    if (!db.profiles) {
      db.profiles = [];
    }

    let profile = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (!profile) {
      const defaultName = email.split('@')[0];
      profile = {
        id: 'profile-' + Date.now(),
        email: email,
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        phone: '',
        address: '',
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
        bio: 'CeylonCart customer',
        created_at: new Date().toISOString()
      };
      db.profiles.push(profile);
      saveDb(db);
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const { name, phone, address, avatar_url, bio } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!isMockMode) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ name, phone, address, avatar_url, bio })
        .eq('email', email)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      return res.json(data);
    }

    // Mock Mode
    const db = getDb();
    if (!db.profiles) {
      db.profiles = [];
    }

    const profileIndex = db.profiles.findIndex(p => p.email.toLowerCase() === email.toLowerCase());

    if (profileIndex === -1) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    db.profiles[profileIndex] = {
      ...db.profiles[profileIndex],
      name: name !== undefined ? name : db.profiles[profileIndex].name,
      phone: phone !== undefined ? phone : db.profiles[profileIndex].phone,
      address: address !== undefined ? address : db.profiles[profileIndex].address,
      avatar_url: avatar_url !== undefined ? avatar_url : db.profiles[profileIndex].avatar_url,
      bio: bio !== undefined ? bio : db.profiles[profileIndex].bio,
    };

    saveDb(db);
    res.json(db.profiles[profileIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
