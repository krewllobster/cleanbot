

module.exports = (throwdown, user_id) => {

  return [
    {
      text: `In order to join "${throwdown.name}", you'll need to register.`,
      callback_id: 'register_to_join',
      actions: [
        {
          name: 'register',
          text: 'Register',
          value: '',
          type: 'button',
          style: 'primary',
        },
        {
          name: 'ignore',
          text: 'Ignore for now',
          value: '',
          type: 'button',
        }
      ]
    },
  ]
}
