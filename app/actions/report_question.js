const agenda = require('../../producer');

module.exports = async (payload, submission, deps) => {
  const { channel: { id: channel_id } } = payload;
  const { question_id, description } = submission;

  const jobData = {
    channel_id,
    description,
    question_id,
    submitted: new Date(),
    user: deps.user
  };

  return agenda().now('save question report', jobData);
};
