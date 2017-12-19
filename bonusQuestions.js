module.exports = {
  allBonus: [
    {
      text: `What is your favorite time of day?`,
      shortName: 'preferred time of day',
      options: [`morning`, `afternoon`, `evening`, `night`],
      type: 'mc'
    },
    {
      text: 'What is your favorite season?',
      shortName: 'preferred season',
      options: ['spring', 'summer', 'fall', 'winter'],
      type: 'mc'
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
      type: `mc`
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
        'Fantasy'
      ],
      type: `mc`
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
      type: `mc`
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
      type: `mc`
    }
  ]
};
