module.exports = JSON.stringify({
  callback_id: 'save_feedback',
  title: 'Send us Feedback',
  submit_label: 'Submit',
  elements: [
    {
      type: 'textarea',
      name: 'description',
      label: 'Feedback',
      optional: false,
      placeholder: `Any and all feedback welcome!`
    }
  ]
});
