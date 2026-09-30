import {
  createAdvisory,
  listAdvisories,
  getAdvisoryById,
  deleteAdvisory
} from '../services/advisoryService.js';
import { askFollowup, upsertFeedback } from '../services/followupService.js';

export async function createAdvisoryHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const inputData = req.body;
    const files = req.files || [];

    const advisory = await createAdvisory(userId, inputData, files);

    res.status(201).json({
      success: true,
      data: { advisory }
    });
  } catch (err) {
    next(err);
  }
}

export async function listAdvisoriesHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const result = await listAdvisories(userId, filters);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdvisoryHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const advisory = await getAdvisoryById(userId, id);

    res.json({
      success: true,
      data: { advisory }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdvisoryHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await deleteAdvisory(userId, id);

    res.json({
      success: true,
      data: { message: 'Advisory deleted successfully' }
    });
  } catch (err) {
    next(err);
  }
}

export async function askFollowupHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { question } = req.body;

    const followup = await askFollowup(userId, id, question);

    res.status(201).json({
      success: true,
      data: { followup }
    });
  } catch (err) {
    next(err);
  }
}

export async function submitFeedbackHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, comment } = req.body;

    const feedback = await upsertFeedback(userId, id, rating, comment);

    res.json({
      success: true,
      data: { feedback }
    });
  } catch (err) {
    next(err);
  }
}
