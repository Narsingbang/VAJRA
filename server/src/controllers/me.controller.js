import { supabaseAdmin } from '../config/supabase.js';
import { getUserQuota } from '../services/quotaService.js';
import { NotFoundError } from '../utils/errors.js';

export async function getMe(req, res, next) {
  try {
    const userId = req.user.id;

    // Load or insert default profile
    let { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      // Auto-create fallback if trigger didn't fire
      const { data: newProfile } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          full_name: req.user.user_metadata?.full_name || '',
          preferred_language: req.user.user_metadata?.preferred_language || 'en'
        })
        .select('*')
        .single();
      profile = newProfile || { id: userId, preferred_language: 'en' };
    }

    const quota = await getUserQuota(userId);

    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email
        },
        profile,
        quota
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const { data: updatedProfile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: {
        profile: updatedProfile
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const userId = req.user.id;

    // Delete user from auth (cascades to all user tables via DB FK on delete cascade)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    res.json({
      success: true,
      data: { message: 'Account and associated data deleted successfully.' }
    });
  } catch (err) {
    next(err);
  }
}
