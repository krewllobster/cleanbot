require('dotenv').config();

const mongoose = require('mongoose');
const axios = require('axios');
const { Category, Throwdown, Question, Bonus } = require('./app/models');

mongoose.Promise = global.Promise;

const db = mongoose.connect(process.env.MONGO_URL, {
  useMongoClient: true
});

const formatQuestion = (q, c) => {
  const {
    question,
    category,
    type,
    difficulty,
    correct_answer,
    incorrect_answers
  } = q;

  let newQuestion = { difficulty, type };
  newQuestion.text = decodeURIComponent(question);
  let answers = [];
  answers.push({ text: decodeURIComponent(correct_answer), correct: true });
  incorrect_answers.forEach(i => {
    answers.push({ text: decodeURIComponent(i), correct: false });
  });
  newQuestion.answers = answers;
  newQuestion.category = parseInt(c, 10);

  return newQuestion;
};

const populateQuestions = async () => {
  const { data: { token } } = await axios.get(
    'https://opentdb.com/api_token.php?command=request'
  );

  const categories = await Category.find();

  console.log(categories.length);
  let allQuestions = [];
  let count = 0;
  let start = new Date();

  for (let i = 0; i < categories.length; i++) {
    let c = categories[i];
    let {
      data: { category_question_count: { total_question_count: qs } }
    } = await axios.get(`https://opentdb.com/api_count.php?category=${c._id}`);

    let remainder = qs < 50 ? qs : qs % 50;
    let fifties = qs < 50 ? 0 : (qs - remainder) / 50;
    console.log(i + ': ' + c.name + ', count: ' + qs);
    let url;
    for (let x = 0; x < fifties; x++) {
      url = `https://opentdb.com/api.php?amount=50&category=${c._id}&encode=url3986&token=${token}`;
      let { data: { results } } = await axios.get(url);
      count += results.length;
      results.forEach(q => allQuestions.push(formatQuestion(q, c._id)));
    }
    url = `https://opentdb.com/api.php?amount=${remainder}&category=${c._id}&encode=url3986&token=${token}`;
    let { data: { results } } = await axios.get(url);
    count += results.length;
    results.forEach(q => allQuestions.push(formatQuestion(q, c._id)));
  }
  //
  let end = new Date();

  console.log(count);
  console.log(start);
  console.log(end);
  console.log(end - start);
  console.log(allQuestions.length);
  //
  const result = await Question.insertMany(allQuestions);

  console.log(result);

  process.exit();
};

const populateBonus = async () => {
  const { allBonus } = require('./bonusQuestions');
  console.log(allBonus);

  const result = await Bonus.insertMany(allBonus);

  console.log(result);
  process.exit();
};
populateBonus();
