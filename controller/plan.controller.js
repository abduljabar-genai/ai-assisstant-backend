import * as planService from '../services/plan.service.js';

const userId = (req) => req.user.userID;

export async function generate(req, res) {
  try {
    const plan = await planService.generatePlanAI(userId(req));
    res.status(201).json({ data: plan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function revision(req, res) {
  try {
    const plan = await planService.generateRevisionPlan(userId(req));
    res.status(200).json({ data: plan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function create(req, res) {
  try {
    const plan = await planService.createPlan(userId(req), req.body);
    res.status(201).json({ message: 'Plan saved.', data: plan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function list(req, res) {
  try {
    const plans = await planService.listPlans(userId(req));
    res.status(200).json({ data: plans });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function get(req, res) {
  try {
    const plan = await planService.getPlan(userId(req), req.params.id);
    res.status(200).json({ data: plan });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export async function update(req, res) {
  try {
    const plan = await planService.updatePlan(userId(req), req.params.id, req.body);
    res.status(200).json({ data: plan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function remove(req, res) {
  try {
    await planService.deletePlan(userId(req), req.params.id);
    res.status(200).json({ message: 'Plan deleted.' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}
