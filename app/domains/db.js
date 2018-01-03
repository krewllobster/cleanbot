const dbInterface = () => {
  const models = require('../models');

  return {
    name: 'mongoDB interface',
    execute: async ({
      entity,
      operation,
      match,
      update,
      options,
      populate
    }) => {
      if (models[entity] && models[entity][operation]) {
        if (populate) {
          return await models[entity]
            [operation](match, update, options)
            .populate(populate)
            .exec();
        }
        return await models[entity][operation](match, update, options);
      } else {
        return new Error('model or operation does not exist');
      }
    }
  };
};

module.exports = dbInterface();
