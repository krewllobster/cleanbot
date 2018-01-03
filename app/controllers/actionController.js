const actions = require('../actions');
const { initSlack, findOrCreateUser } = require('../common');

const { commandFactory, dbInterface, slackApi, exec } = require('../domains');

module.exports = async (req, res) => {
  const payload = JSON.parse(req.body.payload);
  const {
    type,
    token,
    submission,
    user: { id: user_id },
    team: { id: team_id },
    trigger_id
  } = payload;

  let callback_id = payload.callback_id;
  let callback_details = {};

  const isJSON = string => {
    try {
      JSON.parse(string);
    } catch (error) {
      return false;
    }
    return true;
  };

  if (isJSON(callback_id)) {
    console.log('callback is JSON');
    let full = JSON.parse(callback_id);
    callback_id = full.callback_id;
    callback_details = full.details;
  }

  console.log(callback_id);
  console.log(callback_details);

  const errorHandle = err => {
    throw new Error('error in Command Controller::' + err);
  };

  let domains = {
    commandFactory,
    dbInterface,
    exec,
    slackApi
  };

  const slack = await initSlack({ token, team_id }, res, domains);

  const deps = { slack, dbInterface, commandFactory, exec };

  deps.user = await findOrCreateUser(deps, { user_id, team_id });

  console.log('executing received action: ' + callback_id);
  if (type === 'interactive_message') {
    console.log(`calling action ${callback_id}`);
    if (actions.hasOwnProperty(callback_id)) {
      const action = payload.actions[0];
      actions[callback_id](payload, action, deps);
    } else {
      throw new Error('Action does not exist');
    }
  }

  let fullSub = Object.assign({}, submission, callback_details);

  if (type === 'dialog_submission') {
    console.log(`handling dialog ${callback_id}`);
    actions[callback_id](payload, fullSub, deps);
  }
};
