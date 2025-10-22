export const asyncWrapper = (callback) => {
  return async (req, res, next) => {
    await callback(req, res, next).catch(next);
  };
};
