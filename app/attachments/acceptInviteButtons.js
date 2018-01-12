const { brandColor } = require('../constants');
module.exports = ({ throwdown_id, user_to_invite, owner, team_id }) => {
  return [
    {
      color: brandColor,
      text: 'Would you like to accept the invitation?',
      fallback: 'Accept invitation?',
      callback_id: 'accept_invite',
      actions: [
        {
          name: 'accept_invite',
          text: 'Accept',
          value: JSON.stringify({
            throwdown_id,
            user_to_invite,
            owner,
            team_id
          }),
          type: 'button',
          style: 'primary'
        },
        {
          name: 'reject_invite',
          text: 'Reject',
          value: JSON.stringify({
            throwdown_id,
            user_to_invite,
            owner,
            team_id
          }),
          type: 'button',
          style: 'danger'
        }
      ]
    }
  ];
};
