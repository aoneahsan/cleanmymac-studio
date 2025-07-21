import log from 'electron-log';
import * as path from 'path';

// Configure electron-log
log.transports.file.level = 'info';
log.transports.console.level = process.env.NODE_ENV === 'development' ? 'debug' : 'info';

// Set log file location
const userDataPath = process.env.APPDATA || 
  (process.platform === 'darwin' 
    ? path.join(process.env.HOME || '', 'Library/Application Support') 
    : path.join(process.env.HOME || '', '.local/share'));

log.transports.file.resolvePathFn = () => path.join(userDataPath, 'CleanMyMac Pro+/logs/main.log');

// Create logger factory
export function getLogger(module: string) {
  return {
    debug: (message: string, meta?: any) => {
      log.debug(`[${module}] ${message}`, meta);
    },
    info: (message: string, meta?: any) => {
      log.info(`[${module}] ${message}`, meta);
    },
    warn: (message: string, meta?: any) => {
      log.warn(`[${module}] ${message}`, meta);
    },
    error: (message: string, meta?: any) => {
      log.error(`[${module}] ${message}`, meta);
    }
  };
}

// Export default logger
export default log;