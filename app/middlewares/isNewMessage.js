const FRESH_MESSAGE = 60; // seconds

module.exports = (ctx, next) => {
  const { date } = ctx.message;

  if (Date.now() / 1000 > date + FRESH_MESSAGE) {
    return null;
  }

  return next();
};
