

module.exports = (throwdown) => {
  return {
    title: `Throwdown "${throwdown.name}" has been deleted by <@${throwdown.created_by.user_id}|${throwdown.created_by.user_name}>`,
    fields: [
      {
        title: 'Now what?',
        value: `Message about what to do next here`
      }
    ],
    fallback: `Throwdown "${throwdown.name} has been deleted."`,
    attachment_type: "default",
    mrkdwn_in: ["text", "pretext"],
  }
}
