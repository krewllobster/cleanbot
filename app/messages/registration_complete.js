

module.exports = () => {
  return {
    title: "What next?",
    fields: [
      {
        title: 'Create a new throwdown:',
        value: `"/rumble new" or "/rumble new throwdown"`
      },
      {
        title: 'View public throwdowns:',
        value: '/rumble list throwdowns'
      },
      {
        title: `View throwdowns you're a part of:`,
        value: '/rumble my throwdowns'
      }
    ],
    fallback: "Next Steps",
    attachment_type: "default",
  }
}
