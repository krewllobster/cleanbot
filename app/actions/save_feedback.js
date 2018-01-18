const agenda = require('../../producer');

module.exports = async (payload, submission, deps) => {
  const { channel: { id: channel_id } } = payload;

  const { description } = submission;
  const { user } = deps;
  const submitted = new Date();

  const jobData = {
    channel_id,
    description,
    submitted,
    user
  };

  agenda().now('save feedback', jobData);
};
