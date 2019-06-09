const User = require('../Models/User');

module.exports = async (ctx, next) => {
  const { message } = ctx;

  const [user] = await User.findOrCreate({
    where: { uid: message.from.id },
    defaults: {
      name: message.from.username,
      first_name: message.from.first_name,
      last_name: message.from.last_name,
      role: 'new',
    },
  });

  ctx.currentUser = user;

  next(ctx);
};
