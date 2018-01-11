const things = [
  { noun: 'sports', verb: 'Playing' },
  { noun: 'sports', verb: 'Watching' },
  { noun: 'music', verb: 'Listening to' },
  { noun: 'book', verb: 'Reading a' },
  { noun: 'board game', verb: 'Playing a' },
  { noun: 'card game', verb: 'Playing a' },
  { noun: 'crafts', verb: 'Making' },
  { noun: 'friends', verb: 'Talking to' },
  { noun: 'family', verb: 'Spending time with' },
  { noun: 'new people', verb: 'Meeting' },
  { noun: 'video game', verb: 'Playing a' },
  { noun: 'food', verb: 'Cooking' },
  { noun: 'food', verb: 'Tasting new' },
  { noun: 'food', verb: 'Eating' },
  { noun: 'music', verb: 'Playing' },
  { noun: 'music', verb: 'Writing' },
  { noun: 'art', verb: 'Creating' },
  { noun: 'art', verb: 'Experiencing' },
  { noun: 'movie', verb: 'Watching a' },
  { noun: 'movie', verb: 'Going to a' },
  { noun: 'TV', verb: 'Watching' },
  { noun: 'Netflix', verb: 'Watching' }
];

const comparisons = [];

for (let i = 0; i < things.length; i++) {
  for (let j = 1; j < things.length; j++) {
    if (j > i) {
      let t1 = things[i];
      let t2 = things[j];
      comparisons.push({
        category: 1,
        text: `Which would you prefer doing?`,
        shortName: `${t1.verb} ${t1.noun} vs ${t2.verb} ${t2.noun}`,
        answers: [
          { text: `${t1.verb} ${t1.noun}`, correct: false },
          { text: `${t2.verb} ${t2.noun}`, correct: false },
          { text: 'Neither', correct: false },
          { text: 'Both of them!', correct: false }
        ],
        answerType: 'mc',
        questionType: 'preference',
        bonus: true,
        difficulty: 'bonus'
      });
    }
  }
}
//TODO: reformat premade and insert into questions
const premade = [
  {
    text: `What is the best gift you've ever received?`,
    shortName: 'Favorite Gift',
    answers: [],
    answerType: 'long',
    questionType: 'experience'
  },
  {
    text: `What is the best prank you've ever pulled?`,
    shortName: 'Best Prank Ever',
    answers: [],
    answerType: 'long',
    questionType: 'experience'
  },
  {
    text: `What is your favorite time of day?`,
    shortName: 'preferred time of day',
    answers: [`morning`, `afternoon`, `evening`, `night`],
    answerType: 'mc',
    questionType: 'preference'
  },
  {
    text: 'What is your favorite season?',
    shortName: 'preferred season',
    answers: ['spring', 'summer', 'fall', 'winter'],
    answerType: 'mc',
    questionType: 'preference'
  },
  {
    text: `What is your favorite holiday?`,
    shortName: `preferred holiday`,
    options: [
      'New Years',
      'Easter',
      `St. Patrick's Day`,
      'Cinco de Mayo',
      '4th of July',
      'Halloween',
      'Thanksgiving',
      'Christmas',
      'Hanukkah'
    ],
    answerType: `mc`,
    questionType: 'preference'
  },
  {
    text: `What is your favorite book genre?`,
    shortName: `preferred book genre`,
    options: [
      'Romance',
      'Classics',
      'Mystery',
      'Comedy',
      'Non-Fiction',
      'Science Fiction',
      'Fantasy',
      'None of the these'
    ],
    answerType: `mc`,
    questionType: 'preference'
  },
  {
    text: `When you have a free evening, which of these would you prefer to do?`,
    shortName: `preferred activity`,
    options: [
      'Relax at home',
      'Go to a movie',
      'Go to a concert',
      'Go to the theater'
    ],
    answerType: `mc`,
    questionType: 'preference'
  },
  {
    text: `What's your favorite sport?`,
    shortName: `preferred sport`,
    options: [
      'Baseball',
      'Basketball',
      'Football',
      'Track & Field',
      'Soccer',
      'Rugby',
      'Golf',
      'F1',
      'NASCAR',
      'Other',
      'I hate sports!'
    ],
    answerType: `mc`,
    questionType: 'preference'
  }
];

module.exports = {
  allBonus: [...comparisons]
};
