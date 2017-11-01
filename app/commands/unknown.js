
module.exports = async (body, deps) => {
  const {slack, commandFactory, exec} = deps
  const {channel_id} = body

  const unknownMessage = commandFactory('slack').setOperation('basicMessage')
    .setText(`I'm not sure how to "${body.text}" yet`)
    .setChannel(channel_id).setAttachments([tryAgain]).save()

  const response = await exec.one(slack, unknownMessage)
}

const tryAgain = {
  title: "Try out some commands I know!",
  fields: [
    {
      title: 'Create a new throwdown:',
      value: `"/rumble new" or "/rumble new throwdown"`
    },
    {
      title: 'View public throwdowns:',
      value: '"/rumble list throwdowns" or "/rumble list"'
    },
    {
      title: `View throwdowns you're a part of:`,
      value: '"/rumble my throwdowns"'
    }
  ],
  fallback: "Unknown Command",
  attachment_type: "default",
}
