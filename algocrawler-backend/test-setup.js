// test-setup.js
require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./models/Problem');
const User = require('./models/User');
const ActiveRun = require('./models/ActiveRun');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // 1. Get the Easy problem (Two Sum)
    const problem = await Problem.findOne({ difficulty: 'Easy' });

    // 2. Create a dummy user
    let user = await User.findOne({ username: 'testplayer' });
    if (!user) {
      user = await User.create({ username: 'testplayer', passwordHash: 'dummyhash' });
    }

    // 3. Create a dummy Active Run
    const run = await ActiveRun.create({
      userId: user._id,
      currentHP: 100,
      mapSeed: 'test-seed-123'
    });

    console.log('\n=== TEST CREDENTIALS ===');
    console.log(`Problem ID: ${problem._id}`);
    console.log(`Run ID:     ${run._id}`);
    console.log('========================\n');
    
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });