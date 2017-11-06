

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
        value: '"/rumble list throwdowns" or "/rumble list"'
      },
      {
        title: `View throwdowns you're a part of:`,
        value: '"/rumble my throwdowns"'
      }
    ],
    fallback: "Unknown Command",
    attachment_type: "default",
  }
}
