var sd = require("silly-datetime");
//需要使用一个日期时间，格式为 20150920110632
exports.dateTime = sd.format(new Date(), 'YYYYMMDDHHmmss');