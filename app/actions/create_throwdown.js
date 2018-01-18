const agenda = require('../../producer');
const { singleThrowdown, welcomeMessage } = require('../attachments');
const { processing: processingMessage, findRandom } = require('../common');
const moment = require('moment');

module.exports = async (payload, submission, deps) => {
  const {
    team: { id: team_id },
    user: { id: user_id },
    channel: { id: channel_id }
  } = payload;

  const { name, description, category, privacy, start_date } = submission;
  const { slack, dbInterface, commandFactory, exec, user } = deps;
  console.log('*********************');
  console.log(start_date);
  const offset = JSON.parse(start_date);
  const processing = processingMessage(deps, {
    text: 'Processing new Throwdown...',
    user_id
  });

  const { channel } = await processing.next().value;
  const { ts } = await processing.next(channel).value;

  const errorHandle = err => {
    console.log(err);
    throw new Error('error creating throwdown::' + err);
  };

  const newThrowdown = {
    privacy,
    team_id,
    created_by: user._id,
    description,
    round: 0,
    start_date: moment().add(offset.count, offset.units),
    participants: [user._id],
    categories: [category],
    invitees: []
  };

  //check name and send error message if problem found
  const errorBase = commandFactory('slack')
    .setOperation('updateMessage')
    .setChannel(channel.id)
    .setTs(ts);

  if (name) {
    const getGroupList = commandFactory('slack')
      .setClient('userClient')
      .setOperation('getGroups')
      .save();

    const getChannelList = commandFactory('slack')
      .setClient('userClient')
      .setOperation('getChannels')
      .save();

    const [{ groups }, { channels }] = await exec.many([
      [slack, getGroupList],
      [slack, getChannelList]
    ]);
    const allNames = [...groups, ...channels].map(x => x.name);
    const channelName = name
      .split(' ')
      .join('_')
      .toLowerCase();
    //if name has capitals, numbers, underscores or hyphens, or is longer than 21, send error
    if (channelName.match(/[^(a-z|0-9|_|\-)]/) || channelName.length > 21) {
      console.log('throwdown title had invalid character or was too long');
      const invalidNameMessage = errorBase
        .setText('Invalid Throwdown Name. Please try again')
        .save();

      return await exec.one(slack, invalidNameMessage);
    }

    //if public, private, or archived channel shares name, send error
    if (allNames.some(c => c.name === channelName)) {
      console.log('throwdown channel name was already taken');
      const nameTakenMessage = errorBase
        .setText('That name is already taken. Please try again!')
        .save();

      return await exec.one(slack, nameTakenMessage);
    }
  }

  console.log('creating new throwdown in database');

  const findOrCreateThrowdown = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('findOrCreate')
    .setMatch({ name })
    .setUpdate(newThrowdown)
    .save();

  const { doc, created } = await exec.one(dbInterface, findOrCreateThrowdown);

  const newThrowdownMessage = commandFactory('slack')
    .setOperation('updateMessage')
    .setChannel(channel.id)
    .setTs(ts);

  let responseMessage, throwdown;

  if (!created) {
    console.log('throwdown creation was unsuccessful');
    responseMessage = newThrowdownMessage
      .setText(`There was an error creating your Throwdown. Please try again`)
      .setAttachments([])
      .save();

    return await exec.one(slack, responseMessage);
  }

  console.log('throwdown successfully created');

  //added
  const getFullThrowdown = commandFactory('db')
    .setOperation('findFull')
    .setEntity('Throwdown')
    .setMatch({ _id: doc._id })
    .save();
  //added

  throwdown = await exec.one(dbInterface, getFullThrowdown);

  let successTextPrivate = `Congrats, you’re the proud owner of a new invite-only throwdown! You should see a new channel in your channels list. Only people you invite below can join. Once you select their name, they’ll receive an invite message. You’ll get a message each time someone joins your throwdown. 
  
  To see a full list of participants and invitees, type "/rumble my throwdowns".`;
  let successTextPublic = `Congrats, you’re the proud owner of a new public throwdown. You should see a new channel in your channels list. Anyone can see the Throwdown and join, but it’s up to you to promote it! So send a quick note to your coworkers like, “Join my throwdown. . . if you dare! It’s open to anyone. Just type /rumble list and press join!” 
  
  To see a full list of participants and invitees, type "/rumble my throwdowns".`;

  responseMessage = newThrowdownMessage
    .setText(
      throwdown.privacy === 'private' ? successTextPrivate : successTextPublic
    )
    .setAttachments([singleThrowdown(throwdown, user_id, false)])
    .save();

  const sendResponse = await exec.one(slack, responseMessage);

  const [updatedThrowdown, result] = await Promise.all([
    initQuestions(throwdown, deps),
    initChannel(throwdown, deps)
  ]);
  //CHANGE QUESTION TIMING HERE
  console.log('scheduling question job start');
  const questionsJob = agenda().create('send question buttons', {
    throwdown_id: updatedThrowdown._id,
    team_id: team_id,
    user
  });
  console.log('starting questions at ', updatedThrowdown.start_date);

  questionsJob.schedule(updatedThrowdown.start_date);
  questionsJob.repeatEvery('6 hours');
  questionsJob.save();
};

const initChannel = async (throwdown, deps) => {
  console.log('initializing throwdown channel');
  return new Promise(async (resolve, reject) => {
    const { slack, dbInterface, commandFactory, exec, user } = deps;

    const name = throwdown.name
      .split(' ')
      .join('_')
      .toLowerCase();

    const createChannel = commandFactory('slack')
      .setOperation('createConversation')
      .set({ name, private: true })
      .setClient('userClient')
      .save();

    const { channel } = await exec.one(slack, createChannel);

    const setThrowdownChannel = commandFactory('db')
      .setEntity('Throwdown')
      .setOperation('findOneAndUpdate')
      .setMatch({ _id: throwdown._id })
      .setUpdate({ channel: channel.id })
      .save();

    const setChannelTopic = commandFactory('slack')
      .setOperation('setTopic')
      .setChannel(channel.id)
      .setTopic(throwdown.description)
      .setClient('userClient')
      .save();

    const setChannelPurpose = commandFactory('slack')
      .setOperation('setPurpose')
      .setChannel(channel.id)
      .setPurpose(`<@${throwdown.created_by.user_id}>'s challenge`)
      .setClient('userClient')
      .save();

    const responses = await exec.many([
      [dbInterface, setThrowdownChannel],
      [slack, setChannelTopic],
      [slack, setChannelPurpose]
    ]);

    const getBotId = commandFactory('db')
      .setEntity('Team')
      .setOperation('findOne')
      .setMatch({ team_id: throwdown.team_id })
      .save();

    const { bot: { bot_user_id } } = await exec.one(dbInterface, getBotId);

    let usersToInvite = bot_user_id;

    if (throwdown.created_by.user_id !== channel.creator) {
      usersToInvite += `,${throwdown.created_by.user_id}`;
    }

    const inviteBot = commandFactory('slack')
      .setOperation('inviteToConversation')
      .setClient('userClient')
      .setChannel(channel.id)
      .setUsers(usersToInvite)
      .save();

    await exec.one(slack, inviteBot);

    const sendWelcomeMessage = commandFactory('slack')
      .setOperation('basicMessage')
      .setChannel(channel.id)
      .setText(welcomeMessage(throwdown))
      .save();

    const response = exec.one(slack, sendWelcomeMessage);

    resolve(response);
  });
};

const initQuestions = (throwdown, deps) => {
  console.log('initializing throwdown questions');

  const errorHandle = err => {
    console.log(err);
    throw new Error('error creating throwdown::' + err);
  };

  return new Promise(async (resolve, reject) => {
    const { slack, dbInterface, commandFactory, exec, user } = deps;
    const categories = throwdown.categories.map(c => c._id);

    const getQuestions = commandFactory('db')
      .setEntity('Question')
      .setOperation('find')
      .setMatch({ category: { $in: categories } })
      .save();
    const allQuestions = await exec.one(dbInterface, getQuestions);

    let easy = findRandom(
      allQuestions.filter(q => q.difficulty === 'easy'),
      10
    );
    let medium = findRandom(
      allQuestions.filter(q => q.difficulty === 'medium'),
      10
    );
    let hard = findRandom(
      allQuestions.filter(q => q.difficulty === 'hard'),
      10
    );

    const total = easy.length + medium.length + hard.length;
    console.log(total);
    if (total < 30) {
      console.log(
        'fewer than 30 questions returned, fetching general questions'
      );
      const getGeneral = commandFactory('db')
        .setEntity('Question')
        .setOperation('find')
        .setMatch({ category: 9 })
        .save();

      const extras = await exec.one(dbInterface, getGeneral);

      const easyExtra = findRandom(
        extras.filter(q => q.difficulty === 'easy'),
        10 - easy.length
      );
      const mediumExtra = findRandom(
        extras.filter(q => q.difficulty === 'medium'),
        10 - medium.length
      );
      const hardExtra = findRandom(
        extras.filter(q => q.difficulty === 'hard'),
        10 - hard.length
      );

      easy = [...easy, ...easyExtra];
      medium = [...medium, ...mediumExtra];
      hard = [...hard, ...hardExtra];
    }
    const filter = (q, i) => {
      return { question: q._id, round: i + 1 };
    };
    easyQuestions = easy.map(filter);
    medQuestions = medium.map(filter);
    hardQuestions = hard.map(filter);

    const questions = [...easyQuestions, ...medQuestions, ...hardQuestions];

    const updateThrowdown = commandFactory('db')
      .setEntity('Throwdown')
      .setOperation('findOneAndUpdate')
      .setMatch({ _id: throwdown._id })
      .setUpdate({ questions })
      .setOptions({ new: true })
      .save();

    const updated = await exec.one(dbInterface, updateThrowdown);

    resolve(updated);
  });
};
