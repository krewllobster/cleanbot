const { upsertUser } = require('../db_actions')
const messageList = require('../messages')

module.exports = ({trigger_id}) => {
  console.log('message builder reached')
  console.log(JSON.parse(dialog))
  return Promise.resolve({
    type: 'dialog.open',
    client: 'webClient',
    trigger_id,
    dialog,
  })
}

const colors = [
  'Blue',
  'Black',
  'Brown',
  'Purple',
  'Yellow',
  'Orange',
  'Magenta',
  'Pink',
  'Green',
  'Gold',
  'Silver',
  'White',
  'Grey',
  'Chartreuse',
  'Beige',
  'Red',
  'Some other weird color!'
]

const options = colors.sort().map(c => {
  return {label: c, value: c}
})

const sibs = ['None', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'More than seven', `It's complicated!`]

const siblings = sibs.map(s => {
  return {label: s, value: s}
})

const dialog = JSON.stringify({
    "callback_id": "set_registration",
    "title": "Register for Rumblesum",
    "submit_label": "Register",
    "elements": [
        {
            "type": "select",
            "label": "Favorite Color",
            "name": "fav_color",
            "placeholder": "Select your favorite color",
            options,
        },
        {
          type: "select",
          label: 'Siblings',
          name: 'siblings',
          placeholder: 'How many siblings do you have?',
          options: siblings,
        },
        {
            type: "select",
            label: "Deserted Island",
            name: "island",
            placeholder: 'What would you want if you got stuck on a deserted island?',
            options: [
              {label: 'My favorite book', value: 'book'},
              {label: 'My favorite game', value: 'game'},
              {label: 'My favorite music', value: 'music'}
            ]
        },
        {
          type: 'textarea',
          label: 'Favorite B-day Present',
          name: 'birthday_present',
          placeholder: 'Describe the best birthday present you have ever received',
          max_length: '200'
        }
    ]
})
