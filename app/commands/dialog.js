

module.exports = (body) => {
  const { trigger_id } = body
  return {
    type: 'dialog.open',
    client: 'botClient',
    trigger_id,
    dialog,
  }
}

const dialog = JSON.stringify({
    "callback_id": "ryde-46e2b0",
    "title": "Request a Ride",
    "submit_label": "Request",
    "elements": [
        {
            "type": "text",
            "label": "Pickup Location",
            "name": "loc_origin"
        },
        {
            "type": "text",
            "label": "Dropoff Location",
            "name": "loc_destination"
        }
    ]
})
