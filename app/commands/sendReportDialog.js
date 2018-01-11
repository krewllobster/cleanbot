const { reportDialog } = require('../dialogs');

module.exports = async (body, deps) => {
  const { slack, dbInterface, commandFactory, exec, user } = deps;
  const { name, team_id, user_name, user_id, channel_id, trigger_id } = body;

  console.log(trigger_id);

  const sendDialog = commandFactory('slack')
    .setOperation('openDialog')
    .setTrigger(trigger_id)
    .setDialog(reportDialog)
    .save();

  return await exec.one(slack, sendDialog);
};
