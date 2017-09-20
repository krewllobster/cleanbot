

module.exports = ({_id}) => {
  return {
    title: "Would you like to add another category?",
    fallback: "Throwdown Setup",
    attachment_type: "default",
    callback_id: "add_category_branch",
    actions: [
      {name: 'add_category_branch', text: 'Add another category', value: JSON.stringify({_id, add: true}), type: 'button'},
      {name: 'add_category_branch', text: 'Finish setup', value: JSON.stringify({_id, add: false}), type: 'button'},
    ]
  }
}
