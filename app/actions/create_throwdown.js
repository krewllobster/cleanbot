const { upsertThrowdown, findFullThrowdown } = require('../db_actions')
const { User, Throwdown } = require('../models')
const messageList = require('../messages')
const sendMessage = require('../controllers/multiMessageController')

module.exports = async (payload, submission, res) => {

  const {
    team: {id: team_id},
    user: {id: user_id},
    channel: {id: channel_id},
  } = payload

  const {name, description, category, privacy, start_date} = submission

  const processing = {
    type: 'chat.dm',
    client: 'botClient',
    user_id,
    text: 'Creating your throwdown...'
  }

  const [{channel, ts}] = await sendMessage([processing], res)

  const user = await User.findOne({team_id, user_id})

  const {doc, created} = await Throwdown.findOrCreate(
    {name},
    {
      privacy,
      team_id,
      created_by: user._id,
      description,
      start_date: new Date(start_date),
      participants: [user._id],
      categories: [category]
    }
  )

  const nameTaken = {
    type: 'chat.update',
    client: 'botClient',
    text: `Look's like that name's been taken. Please try again!`,
    channel_id: channel,
    message_ts: ts,
  }

  if (created) {
    const throwdown = await findFullThrowdown({_id: doc._id})

    const message = {
      type: 'chat.update',
      client: 'botClient',
      text: 'Congratulations, your Throwdown is now set up!',
      channel_id: channel,
      message_ts: ts,
      attachments: [messageList.single_throwdown({throwdown, user_id, public: false})]
    }

    if (throwdown.privacy === 'private') {
      message.text += ` You can invite people using the button below.`
    } else if (throwdown.privacy === 'public') {
      message.text += ` Your throwdown now shows up for anyone to join.`
    }

    sendMessage([message], res)

  } else if (!created) {
    sendMessage([nameTaken], res)
  }

}
