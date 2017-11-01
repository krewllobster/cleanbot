const commands = require('../commands')
const {initUser} = require('../common')

const {
  commandFactory,
  dbInterface,
  slackApi,
  exec
} = require('../domains')

module.exports = async ({body}, res) => {

  const errorHandle = (err) => {
    throw new Error('error in Command Controller::' + err)
  }

  let domains = {
    commandFactory,
    dbInterface,
    exec,
    slackApi
  }

  const deps = await initUser(body, res, domains).catch(errorHandle)

  if (commands.hasOwnProperty(body.text)) {
    console.log(`passing control to command: "${body.text}"`)
    await commands[body.text](body, deps).catch(errorHandle)
  } else {
    console.log(`unknown command: "${body.text}"`)
    await commands['unknown'](body, deps).catch(errorHandle)
  }
}
