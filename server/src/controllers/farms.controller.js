import { supabaseAdmin } from '../config/supabase.js';
import { NotFoundError } from '../utils/errors.js';

export async function listFarms(req, res, next) {
  try {
    const userId = req.user.id;

    const { data: farms, error } = await supabaseAdmin
      .from('farms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { farms: farms || [] }
    });
  } catch (err) {
    next(err);
  }
}

export async function createFarm(req, res, next) {
  try {
    const userId = req.user.id;
    const farmData = { ...req.body, user_id: userId };

    const { data: newFarm, error } = await supabaseAdmin
      .from('farms')
      .insert(farmData)
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: { farm: newFarm }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateFarm(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const { data: updatedFarm, error } = await supabaseAdmin
      .from('farms')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error || !updatedFarm) {
      throw new NotFoundError('Farm not found or does not belong to you');
    }

    res.json({
      success: true,
      data: { farm: updatedFarm }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteFarm(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('farms')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('id');

    if (error || !data || data.length === 0) {
      throw new NotFoundError('Farm not found or does not belong to you');
    }

    res.json({
      success: true,
      data: { message: 'Farm deleted successfully' }
    });
  } catch (err) {
    next(err);
  }
}
