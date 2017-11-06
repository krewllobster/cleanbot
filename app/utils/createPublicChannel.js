const { Team } = require('../models')

module.exports = (botClient, team_id, user_id, throwdown) => {
  let name = throwdown.name.replace(/\s/g, "_").replace(/\W+/g, "")
  let users = throwdown.participants.map(p => p.user_id)

  console.log('name changed to : ' + name)

  const nameFree = botClient.conversations.list()
                    .then(({channels}) => {
                      if (channels.some(c => c.name === name)) {
                        return Promise.reject('name already taken')
                      }
                      return true
                    })
                    .catch(err => err)

  const channel = botClient.conversations.open({users})
                    .then(({ok, channel}) => {
                      console.log('channel created')
                      console.log(channel)
                      if (!ok) {
                        return Promise.reject('could not create channel')
                      }
                      return channel
                    })
                    .catch(err => err)

  const botUserId = Team.findOne({team_id}).then(team => team.bot.bot_user_id)

  return Promise.all([nameFree, channel, botUserId])
    .then(([nameFree, channel, botUserId]) => {
      if (!nameFree) {
        return Promise.reject('name already taken')
      }
      return webClient.conversations.invite(channel.id, botUserId)
    })
    .then(response => {
      console.log('bot user invited to channel')
      console.log(response)
      if(response.channel.creator !== user_id) {
        return webClient.conversations.invite(response.channel.id, user_id)
          .then(response => response.channel)
          .catch(err => err)
      }
      return response.channel
    })
    .then(resChannel => {
      const purpose = `This channel will be where members of throwdown "${name}" will be asked questions and can view leaderboards!`
      return webClient.conversations.setPurpose(resChannel.id, purpose)
    })
    .then(response => {
      if (!response.ok) return Promise.reject('error setting purpose')
      return response.channel
    })
    .catch(err => {
      console.log('err creating public channel::' + err)
      return err
    })
}
