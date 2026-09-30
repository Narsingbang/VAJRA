export const logger = {
  info: (msg, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      time: new Date().toISOString(),
      message: msg,
      ...meta
    }));
  },
  warn: (msg, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'warn',
      time: new Date().toISOString(),
      message: msg,
      ...meta
    }));
  },
  error: (msg, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      time: new Date().toISOString(),
      message: msg,
      ...meta
    }));
  },
  debug: (msg, meta = {}) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(JSON.stringify({
        level: 'debug',
        time: new Date().toISOString(),
        message: msg,
        ...meta
      }));
    }
  }
};
