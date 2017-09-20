const reg_question_1 = require('./reg_question_1')
const reg_question_2 = require('./reg_question_2')
const registration_complete = require('./registration_complete')
const set_privacy = require('./set_privacy')
const add_category = require('./add_category')
const add_another_category = require('./add_another_category')

module.exports = {
  reg_question_1: (opts) => reg_question_1(opts),
  reg_question_2: (opts) => reg_question_2(opts),
  registration_complete: (opts) => registration_complete(opts),
  set_privacy: (opts) => set_privacy(opts),
  add_category: (opts) => add_category(opts),
  add_another_category: (opts) => add_another_category(opts)
}
