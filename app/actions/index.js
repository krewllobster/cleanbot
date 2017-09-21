const set_reg_question_1 = require('./set_reg_question_1')
const set_reg_question_2 = require('./set_reg_question_2')
const set_throwdown_privacy = require('./set_throwdown_privacy')
const add_throwdown_category = require('./add_throwdown_category')
const add_category_branch = require('./add_category_branch')
const set_throwdown_start_date = require('./set_throwdown_start_date')
const throwdown_action = require('./throwdown_action')


module.exports = (req, res) => {
  const payload = JSON.parse(req.body.payload)
  const action = payload.actions[0]
  return {
    set_reg_question_1: () => set_reg_question_1(payload, action, res),
    set_reg_question_2: () => set_reg_question_2(payload, action, res),
    set_throwdown_privacy: () => set_throwdown_privacy(payload, action, res),
    add_throwdown_category: () => add_throwdown_category(payload, action, res),
    add_category_branch: () => add_category_branch(payload, action, res),
    set_throwdown_start_date: () => set_throwdown_start_date(payload, action, res),
    throwdown_action: () => throwdown_action(payload, action, res),
  }
}
