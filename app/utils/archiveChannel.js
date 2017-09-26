

module.exports = (webClient, channel_id) => {
  return webClient.conversations.archive(channel_id)
    .then(({ok}) => {
      if (ok) return true
      return Promise.reject('unable to archive')
    })
    .catch(err => {
      console.log('error archiving conversation::' + err)
      return err
    })
}
