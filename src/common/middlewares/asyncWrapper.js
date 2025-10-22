export const AsyncWrapper = (callback) => {
  return async (req, res, next) => {
    await callback(req, res, next).catch(next);
  };
};
