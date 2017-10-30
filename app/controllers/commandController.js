const { verToken, checkUser, to } = require('../utils')
const commands = require('../commands')

module.exports = async ({body}, res) => {
  const verified = verToken(body.token)

  if(!verified) {
    throw new Error('token does not match, invalid request')
  }
  //end with 200 here to let slack client know command received
  res.status(200).end()

  const user = await checkUser(body, res.botClient)

  if(!user) {
    throw new Error('user not found or not created')
  }

  if (commands.hasOwnProperty(body.text)) {
    [err, response] = await to(commands[body.text](body, res))
  } else {
    [err, response] = await to(commands['unknown'](body, res))
  }
  if (err) {
    console.log(err)
  }
}
