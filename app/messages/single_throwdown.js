const moment = require('moment')

module.exports = (throwdown) => {
  let started = moment().isSameOrAfter(
    throwdown.start_date, 'day'
  )

  console.log('formating single throwdown_______________')
  console.log(throwdown)

  return {
    title: throwdown.name,
    callback_id: 'throwdown_action',
    fields: [
      {
        title: 'Question Categories:',
        value: `${
          throwdown.categories.reduce(
            (accumulator, category, index) => {
              return accumulator + `${index+1}. ${category.name}\n`
            },
            ''
          )
        }`
      },
      {
        title: 'Participants:',
        value: `${
          throwdown.participants.reduce(
            (accumulator, participant) => {
              return accumulator + `<@${participant.user_id}|${participant.user_name}>`
            },
            ''
          )
        }`
      },
      {
        title: 'Created By:',
        value: `<@${throwdown.created_by.user_id}|${throwdown.created_by.user_name}>`,
        short: true
      },
      {
        title: `${started ? 'Throwdown Started:' : 'Throwdown Starts:'}`,
        value: `${moment(throwdown.start_date).format('MMM Do, YYYY')}`,
        short: true
      }
    ],
  "mrkdwn_in": [
        "text",
        "pretext"
    ],
  }
}
