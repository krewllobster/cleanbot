const dialogs = require('../dialogs')
const processingMessage = require('../common').processing

module.exports = async (body, deps) => {
  const {name, team_id, channel_id, user_name, user_id, trigger_id} = body
  const {slack, dbInterface, commandFactory, exec} = deps

  const errorHandle = (err) => {
    console.log(err)
    throw new Error('error in createThrowdown')
  }

  const processing = processingMessage(deps, {
    text: 'Processing new Throwdown',
    user_id
  })

  const {channel} = await processing.next().value
  const {ts} = await processing.next(channel).value

  console.log('fetching categories to populate dialog')
  const getCategories =
    commandFactory('db').setEntity('Category').setOperation('find').save()

  const categories = await exec.one(dbInterface, getCategories).catch(errorHandle)

  const catList = categories.map(c => ({label: c.name, value: c._id}))

  const sendDialog =
    commandFactory('slack').setOperation('openDialog').setTrigger(trigger_id)
      .setDialog(dialogs.new_throwdown(catList)).save()

  console.log('sending dialog')
  const dialogSent = await exec.one(slack, sendDialog).catch(errorHandle)

  const response = await processing.next(ts).value
}
