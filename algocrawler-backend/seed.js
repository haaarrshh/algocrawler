
require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./models/Problem');

const easyAscii = `
   .---.
  / ___ \\
 | O   O |
  \\  w  /
   '---'
`;

const mediumAscii = `
   /\\  /\\
  /  \\/  \\
 | |    | |
 | | () | |
  \\ \\  / /
   \\/  \\/
`;

const hardAscii = `
     \\||/
     |  @___oo
   /\\  /\\   /
  / /__\\ \\ /
 /o      \\/
`;

const problems = [
  {
    title: "Array Slime: Two Sum",
    difficulty: "Easy",
    category: "Arrays",
    promptText: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    boilerplateCode: "def twoSum(nums, target):\n    # Write your solution here\n    pass",
    testCases: [
      { input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", expectedOutput: "[1,2]" }
    ],
    asciiArt: easyAscii
  },
  {
    title: "Stack Spider: Valid Parentheses",
    difficulty: "Medium",
    category: "Stacks",
    promptText: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    boilerplateCode: "def isValid(s):\n    # Write your solution here\n    pass",
    testCases: [
      { input: "s = '()'", expectedOutput: "true" },
      { input: "s = '()[]{}'", expectedOutput: "true" },
      { input: "s = '(]'", expectedOutput: "false" }
    ],
    asciiArt: mediumAscii
  },
  {
    title: "Linked Lich: Merge K Sorted Lists",
    difficulty: "Hard",
    category: "Linked Lists",
    promptText: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    boilerplateCode: "def mergeKLists(lists):\n    # Write your solution here\n    pass",
    testCases: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]" },
      { input: "lists = []", expectedOutput: "[]" }
    ],
    asciiArt: hardAscii
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected. Initiating database wipe...');
    await Problem.deleteMany({});
    console.log('Seeding dungeon entities...');
    await Problem.insertMany(problems);
    console.log('Dungeon successfully seeded. Terminating script.');
    process.exit();
  })
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });