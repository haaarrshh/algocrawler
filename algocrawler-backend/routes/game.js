const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const ActiveRun = require('../models/ActiveRun');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

// POST /api/game/start - Now protected ny requireAuth 
router.post('/start', requireAuth, async (req, res) => {
  try {
    // We now securely get the user ID from the JWT token
    const newRun = await ActiveRun.create({
      userId: req.user.id, 
      currentFloor: 1,
      currentHP: 100,
      mapSeed: Math.random().toString(36).substring(7)
    });

    res.json(newRun);
  } catch (err) {
    res.status(500).json({ error: "Failed to start run" });
  }
});

// GET /api/game/:runId/encounter - Fetches the monster for the current floor
router.get('/:runId/encounter', async (req, res) => {
  try {
    const run = await ActiveRun.findById(req.params.runId);
    if (!run) return res.status(404).json({ error: "Run not found" });

    // Determine difficulty based on current floor
    let difficultyTarget = 'Easy';
    if (run.currentFloor === 2) difficultyTarget = 'Medium';
    if (run.currentFloor >= 3) difficultyTarget = 'Hard';

    // Fetch a problem matching the difficulty
    const problem = await Problem.findOne({ difficulty: difficultyTarget });

    res.json({
      runDetails: {
        hp: run.currentHP,
        floor: run.currentFloor
      },
      problem: problem
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch encounter" });
  }
});

module.exports = router;