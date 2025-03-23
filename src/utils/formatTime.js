/**
 * 日期时间格式化
 * @param {string | number | Date} time 需要格式化的时间
 * @param {string} format 格式化模式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
export function formatDateTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return '';
  
  let date;
  if (typeof time === 'object') {
    date = time;
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  
  const formatObj = {
    YYYY: date.getFullYear(),
    MM: date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1,
    DD: date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
    HH: date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
    mm: date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
    ss: date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  };
  
  return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, (match) => {
    return formatObj[match];
  });
}

export default {
  formatDateTime
};