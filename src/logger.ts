import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: 'info', // Minimum level to log
  format: format.combine(
    format.prettyPrint(),
    format.colorize(), // Adds color to output
    format.timestamp(), // Adds timestamp
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}. `;
    }),
  ),
  transports: [
    new transports.Console(), // Log to console
  ],
});
