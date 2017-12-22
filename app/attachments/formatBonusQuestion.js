module.exports = (
  { _id, text, shortName, options, type },
  { user, throwdown, round }
) => {
  let buttons = [];
  let dropdownOptions = [];

  options.forEach(a => {
    const value = JSON.stringify({
      bonus: _id,
      shortName,
      response: a,
      throwdown,
      round
    });
    buttons.push({
      name: a,
      text: a,
      value,
      type: 'button'
    });
    dropdownOptions.push({
      text: a,
      value
    });
  });

  const dropdown = [
    {
      type: 'select',
      text: 'select an option',
      name: shortName,
      options: dropdownOptions
    }
  ];

  return [
    {
      text: `Bonus! ${text}`,
      callback_id: 'save_user_data',
      fallback: 'New bonus Question!',
      actions: options.length > 4 ? dropdown : buttons
    }
  ];
};
