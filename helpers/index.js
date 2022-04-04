exports.successResult = function (res, msg, data) {
  let result = {
    status: 1,
    msg: msg,
    data: data,
  };
  return res.status(200).json(result);
};
