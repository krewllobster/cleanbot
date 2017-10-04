

module.exports = (throwdown) => {
  return {
    title: `Throwdown "${throwdown.name}" has been deleted by <@${throwdown.created_by.user_id}|${throwdown.created_by.user_name}>`,
    fields: [
      {
        title: 'What does this mean?',
        value: `The creator of this Throwdown chose to delete it.\nWhether or not the Throwdown started, your stats wont be affected!`
      }
    ],
    fallback: `Throwdown "${throwdown.name} has been deleted."`,
    attachment_type: "default",
    mrkdwn_in: ["text", "pretext"],
  }
}
