const commands = require('../commands');
const { initSlack, findOrCreateUser } = require('../common');

const { commandFactory, dbInterface, slackApi, exec } = require('../domains');

module.exports = async ({ body }, res) => {
  const errorHandle = err => {
    throw new Error('error in Command Controller::' + err);
  };

  let domains = {
    commandFactory,
    dbInterface,
    exec,
    slackApi
  };

  const slack = await initSlack(body, res, domains);

  console.log('slack initiated?');

  const deps = { slack, dbInterface, commandFactory, exec };

  deps.user = await findOrCreateUser(deps, {
    user_id: body.user_id,
    team_id: body.team_id
  });

  console.log(deps.user);
  console.log('executing received command: ' + body.text);

  if (commands.hasOwnProperty(body.text)) {
    console.log(`passing control to command: "${body.text}"`);
    await commands[body.text](body, deps).catch(errorHandle);
  } else {
    console.log(`unknown command: "${body.text}"`);
    await commands['unknown'](body, deps).catch(errorHandle);
  }
};
