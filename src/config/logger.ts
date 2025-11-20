import winston from 'winston';
import moment from 'moment';
import path from 'path';
import callsites from 'callsites';

const filterOnly = (level: string) => winston.format((info) => {
  return info.level === level ? info : false;
})();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: `logs/error-${moment().format('YYYY-MM-DD')}.log`, level: 'error', format: filterOnly('error') }),
    new winston.transports.File({ filename: `logs/info-${moment().format('YYYY-MM-DD')}.log`, level: 'info', format: filterOnly('info') })
  ]
});

function customLogger() {
  return {
    info: (message: string) => {
      const site = callsites()[1];
      const fileName = site.getFileName() ? path.basename(<string>site.getFileName()).replace('.ts', '') : 'unknown';
      const methodName = site.getFunctionName() ?? 'unknown';
      logger.info({
        service: `${fileName}${methodName !== 'unknown' ? `.${methodName}` : ''}`,
        message
      });
    },
    error: (message: unknown) => {
      const site = callsites()[1];
      const fileName = site.getFileName() ? path.basename(<string>site.getFileName()).replace('.ts', '') : 'unknown';
      const methodName = site.getFunctionName() ?? 'unknown';
      logger.error({
        message,
        service: `${fileName}${methodName !== 'unknown' ? `.${methodName}` : ''}`
      });
    }
  };
}

export default customLogger;