const exec = () => {
  const one = async (domain, command) => {
    console.log(
      `executing "${command.operation}${command.entity
        ? ' ' + command.entity
        : ''}" through "${domain.name}"`
    );
    return await domain.execute(command).catch(err => {
      console.log(command);
      console.log('error executing above command::' + err);
      throw err;
    });
  };

  const many = instructions => {
    let promiseList = instructions.map(([domain, command]) => {
      return one(domain, command);
    });
    return Promise.all(promiseList).catch(err => {
      console.log('error executing one of above commands::' + err);
      throw err;
    });
  };

  return {
    one,
    many
  };
};

module.exports = exec();
