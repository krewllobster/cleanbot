const { brandColor } = require('../constants');
module.exports = ({ participants, invitees, _id }) => {
  let participantList, inviteeList;
  if (participants[0]) {
    participantList = participants.map(p => `<@${p.user_id}>`).join(', ');
  }

  if (invitees[0]) {
    inviteeList = invitees.map(i => `<@${i.user_id}>`).join(', ');
  }

  return [
    {
      title: 'Current participants:',
      text: participantList,
      mrkdwn_in: ['text']
    },
    {
      title: 'Invited but not joined:',
      text: inviteeList,
      mrkdwn_in: ['text']
    },
    {
      text: 'Select a user',
      fallback: 'Invite a user to this throwdown',
      callback_id: 'send_invite',
      actions: [
        {
          name: _id,
          text: 'select a user',
          type: 'select',
          data_source: 'users'
        }
      ]
    }
  ];
};
