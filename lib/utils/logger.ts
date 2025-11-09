/**
 * Logger intelligent pour JomionStore
 * Désactive automatiquement les logs en production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      enabled: process.env.NODE_ENV !== 'production',
      level: 'debug',
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const requestedLevelIndex = levels.indexOf(level);

    return requestedLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): any[] {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }[level];

    return [`${emoji} ${timestamp} ${prefix} ${message}`, ...args];
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(...this.formatMessage('debug', message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(...this.formatMessage('info', message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...this.formatMessage('warn', message, ...args));
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(...this.formatMessage('error', message, ...args));
    }
  }

  // Méthode pour logger des objets
  object(label: string, obj: any): void {
    if (this.shouldLog('debug')) {
      console.log(`🔍 ${label}:`, obj);
    }
  }

  // Méthode pour logger des groupes
  group(label: string, callback: () => void): void {
    if (this.shouldLog('debug')) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  }

  // Méthode pour mesurer le temps d'exécution
  time(label: string): void {
    if (this.shouldLog('debug')) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog('debug')) {
      console.timeEnd(label);
    }
  }
}

// Instances pré-configurées pour différents modules
export const logger = new Logger();
export const apiLogger = new Logger({ prefix: 'API' });
export const dbLogger = new Logger({ prefix: 'DB' });
export const authLogger = new Logger({ prefix: 'AUTH' });
export const paymentLogger = new Logger({ prefix: 'PAYMENT' });
export const lygosLogger = new Logger({ prefix: 'LYGOS' });

// Export de la classe pour créer des loggers personnalisés
export { Logger };

// Fonction helper pour remplacer console.log
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  object: logger.object.bind(logger),
  group: logger.group.bind(logger),
  time: logger.time.bind(logger),
  timeEnd: logger.timeEnd.bind(logger),
};
