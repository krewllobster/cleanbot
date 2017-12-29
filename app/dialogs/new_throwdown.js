const moment = require('moment');

module.exports = categories => {
  let dates = [
    {
      label: `In 2 minutes`,
      value: JSON.stringify({ count: 1, units: 'm' })
    },
    {
      label: 'In 5 minutes',
      value: JSON.stringify({ count: 5, units: 'm' })
    },
    {
      label: `In 1 hour`,
      value: JSON.stringify({ count: 1, units: 'h' })
    },
    {
      label: 'In 6 hours',
      value: JSON.stringify({ count: 6, units: 'h' })
    },
    {
      label: 'In 1 day',
      value: JSON.stringify({ count: 1, units: 'd' })
    },
    {
      label: 'In 2 days',
      value: JSON.stringify({ count: 2, units: 'd' })
    }
  ];

  console.log(dates);
  //minutes
  // for (i = 1; i < 5; i++) {
  //   let d = moment().add(i, 'minutes');
  //   let date = {
  //     label: `In ${i} minute${i > 1 ? 's' : ''}`,
  //     value: d
  //   };
  //   dates.push(date);
  // }

  //use days
  // for (i = 1; i < 8; i++) {
  //   let d = moment().add(i, 'days')
  //   console.log(i, d.format('MMM Do'))
  //   if (d.format('e') !== '0' && d.format('e') !== '6') {
  //     let date = {
  //       label: d.format('ddd, MMM Do'),
  //       value: d
  //     }
  //     dates.push(date)
  //   }
  // }

  return JSON.stringify({
    callback_id: 'create_throwdown',
    title: 'Create New Throwdown',
    submit_label: 'Create!',
    elements: [
      {
        type: 'text',
        name: 'name',
        label: 'Throwdown Name',
        placeholder: `My first challenge!`,
        hint: `no numbers or symbols please!`,
        max_length: 21
      },
      {
        type: 'text',
        name: 'description',
        label: 'Short Description',
        optional: true,
        placeholder: `Redemption for last week's musical theater Throwdown fiasco`,
        max_length: 150
      },
      {
        type: 'select',
        label: 'Question Category',
        name: 'category',
        placeholder: `What is the subject of this Throwdown?`,
        options: categories
      },
      {
        type: 'select',
        label: 'Who can join?',
        name: 'privacy',
        options: [
          { label: 'Anyone! (public)', value: 'public' },
          { label: 'Only people I invite. (private)', value: 'private' }
        ]
      },
      {
        type: 'select',
        label: 'Start Date',
        name: 'start_date',
        placeholder: 'When should this throwdown start sending questions?',
        options: dates
      }
    ]
  });
};
