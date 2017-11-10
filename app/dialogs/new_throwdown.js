const moment = require('moment')

module.exports = (categories) => {
  let dates = []

  //minutes
  for (i = 1; i < 5; i++) {
    let d = moment().add(i*30, 'seconds')
    let date = {
      label: `${i*30} seconds from now`,
      value: d
    }
    dates.push(date)
  }

  //use days
  // for (i = 1; i < 8; i++) {
  //   let d = moment().add(i, 'days')
  //   console.log(i, d.format('MMM Do'))
  //   if (d.format('e') !== '0' && d.format('e') !== '6') {
  //     let date = {
  //       label: d.format('ddd, MMM Do'),
  //       value: d
  //     }
  //     dates.push(date)
  //   }
  // }

  return JSON.stringify({
    "callback_id": "create_throwdown",
    "title": 'Create New Throwdown',
    "submit_label": "Create!",
    "elements": [
      {
        type: 'text',
        name: 'name',
        label: 'Throwdown Name',
        placeholder: `My first challenge!`,
        max_length: 21
      },
      {
        type: 'text',
        name: 'description',
        label: 'Short Description',
        optional: true,
        placeholder: `Redemption for last week's musical theater Throwdown fiasco`,
        max_length: 150,
      },
      {
        type: "select",
        label: 'Question Category',
        name: 'category',
        placeholder: `What is the subject of this Throwdown?`,
        options: categories,
      },
      {
          "type": "select",
          "label": "Who can join?",
          "name": "privacy",
          options: [
            {label: "Anyone! (public)", value: 'public'},
            {label: "Only people I invite. (private)", value: 'private'}
          ],
      },
      {
        type: 'select',
        label: 'Start Date',
        name: 'start_date',
        placeholder: 'Select the first day of this Throwdown',
        options: dates,
      }
    ]
})}
