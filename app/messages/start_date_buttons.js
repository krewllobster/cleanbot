const moment = require('moment')


module.exports = ({_id}) => {
  let buttons = []
  for (i = 1; i < 8; i++) {
    let d = moment().add(i, 'days')
    console.log(i, d.format('MMM Do'))
    if (d.format('e') === '0' || d.format('e') === '6') {
      console.log('weekend')
    } else {
      let button = {
        name: d.format('ddd MMM Do YYYY'),
        text: d.format('ddd, MMM Do'),
        value: JSON.stringify({
          _id,
          date: d
        }),
        type: 'button'
      }
      buttons.push(button)
    }
  }

  return {
    title: 'Choose a start date for this throwdown',
    fallback: "Throwdown setup",
    attachment_type: "default",
    callback_id: "set_throwdown_start_date",
    actions: buttons
  }
}
