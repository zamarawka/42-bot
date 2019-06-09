module.exports = (ctx, next) => {
  ctx.logger.info(ctx.message);

  next();
};
