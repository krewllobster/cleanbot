

const colors = [
  'blue',
  'black',
  'brown',
  'purple',
  'yellow',
  'orange',
  'magenta',
  'pink',
  'green',
  'gold',
  'silver',
  'white',
  'grey',
  'chartreuse',
  'beige',
]

const options = colors.sort().map(c => {
  return {text: c, value: c}
})

module.exports = () => {
  return {
    text: "What is your favorite color?",
    fallback: "Personal questions for registration",
    attachment_type: "default",
    callback_id: "set_reg_question_2",
    actions: [
      {
        name: 'set_reg_question_2',
        text: 'Select a color',
        type: 'select',
        options
      }
    ]
  }
}
