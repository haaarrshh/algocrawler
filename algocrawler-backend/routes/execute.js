const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const ActiveRun = require('../models/ActiveRun');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');


const simulateSecureExecution = async (code, testCases) => {

  await new Promise(resolve => setTimeout(resolve, 1500));


  if (!code || code.length < 15 || code.includes('pass')) {
    return {
      success: false,
      passedCount: 0,
      totalCount: testCases.length,
      log: "Syntax Error or logic flaw detected."
    };
  }

  
  return {
    success: true,
    passedCount: testCases.length,
    totalCount: testCases.length,
    log: "All test cases passed successfully!"
  };
};


router.post('/', requireAuth, async (req, res) => {
  try {
    const { runId, problemId, code } = req.body;

    const run = await ActiveRun.findById(runId);
    if (!run) return res.status(404).json({ error: "Run not found" });

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    
    const executionResult = await simulateSecureExecution(code, problem.testCases);

    let combatReport = {};

    if (executionResult.success) {
      run.currentFloor += 1;
      await run.save();

      
      if (run.currentFloor > 3) {
        const user = await User.findById(run.userId);
        user.totalXP += 500; 
        await user.save();

        
        await ActiveRun.findByIdAndDelete(run._id); 
      }

      combatReport = {
        status: 'VICTORY',
        message: 'Compilation successful. The monster is destroyed!',
        hpRemaining: run.currentHP,
        currentFloor: run.currentFloor,
        details: executionResult
      };
    } else {
      const DAMAGE_TAKEN = 25;
      run.currentHP -= DAMAGE_TAKEN;

      if (run.currentHP <= 0) {
        run.currentHP = 0;
        
        
        const user = await User.findById(run.userId);
        user.totalXP += (run.currentFloor * 50); 
        await user.save();

        
        await ActiveRun.findByIdAndDelete(run._id);

        combatReport = {
          status: 'GAME_OVER',
          message: `Execution failed. You took ${DAMAGE_TAKEN} damage. HP depleted.`,
          hpRemaining: 0,
          details: executionResult
        };
      } else {
        await run.save();
        combatReport = {
          status: 'DAMAGE_TAKEN',
          message: `Execution failed. The monster attacks! You take ${DAMAGE_TAKEN} damage.`,
          hpRemaining: run.currentHP,
          details: executionResult
        };
      }
    }

    res.json(combatReport);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Execution endpoint failed." });
  }
});

module.exports = router;