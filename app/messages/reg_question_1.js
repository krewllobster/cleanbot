

module.exports = () => {
  return {
    text: "Which item would you want most on a desert island? (You do have food and water!)",
    replace_original: false,
    fallback: "Personal questions for registration",
    attachment_type: "default",
    callback_id: "set_reg_question_1",
    actions: [
      {name: 'set_reg_question_1', text: 'A book', value: 'book', type: 'button'},
      {name: 'set_reg_question_1', text: 'Music', value: 'music', type: 'button'},
      {name: 'set_reg_question_1', text: 'Games', value: 'games', type: 'button'}
    ]
  }
}
