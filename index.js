import express from 'express';
import { promises } from 'fs';
import winston from 'winston';
import gradesRouter from './routes/grades.js';

const app = express();
const { readFile, writeFile } = promises;
const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(
  ({ level, message, label, timestamp }) =>
    `${timestamp} [${label}] ${level} ${message}`
);

global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'api.log' }),
  ],
  format: combine(label({ label: 'GradesControl-api' }), timestamp(), myFormat),
});
global.gradesFile = 'grades.json';

app.use(express.json());

app.use('/grades', gradesRouter);

app.listen(3000, async () => {
  try {
    const data = JSON.parse(await readFile(gradesFile));

    if (!data.nextId || !data.grades) {
      throw new Error(`'grades.json' data structure is not present.`);
    }

    logger.info(`Structured 'grades.json' file found.`);
  } catch (err) {
    logger.info(`'grades.json' file not found or not structured.`);

    const initialJson = JSON.parse(await readFile('grades-example.json'));

    await writeFile(gradesFile, JSON.stringify(initialJson, null, 2));

    logger.info(`'grades.json' file created.`);
  }

  logger.info('API started!');
});
