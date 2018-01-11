module.exports = JSON.stringify({
  callback_id: 'report_question',
  title: 'Report a Question',
  submit_label: 'Report',
  elements: [
    {
      type: 'text',
      name: 'question_id',
      label: 'Question ID',
      placeholder: ``,
      hint: `Paste the ID that was sent after the question here`
    },
    {
      type: 'textarea',
      name: 'description',
      label: 'Short Description',
      optional: true,
      placeholder: ``,
      hint: 'Please describe your reason for reporting this question.'
    }
  ]
});
