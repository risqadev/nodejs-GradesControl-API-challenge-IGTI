import express from 'express';
import { promises } from 'fs';

const { readFile, writeFile } = promises;

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    let { student, subject, type, value } = req.body;
    student = String(student).trim();
    subject = String(subject).trim();
    type = String(type).trim();
    value = Number(value);

    if (
      !student ||
      student === 'undefined' ||
      !subject ||
      subject === 'undefined' ||
      !type ||
      type === 'undefined' ||
      (!value && value !== 0)
    ) {
      throw new Error(
        `The 'student', 'subject', 'type' and 'value' values are required.`
      );
    }

    const data = JSON.parse(await readFile(global.gradesFile));

    const grade = {
      id: data.nextId++,
      student,
      subject,
      type,
      value,
      timestamp: new Date(),
    };

    data.grades.push(grade);

    await writeFile(global.gradesFile, JSON.stringify(data, null, 2));

    res.send(grade);

    logger.info(
      `${req.method} ${req.baseUrl}: created account with id ${account.id}`
    );
  } catch (err) {
    return next(err);
  }
  logger.info(``);
});

router.get('/', async (req, res, next) => {
  try {
    const { grades } = JSON.parse(await readFile(global.gradesFile));

    res.send(grades);
  } catch (err) {
    return next(err);
  }
  logger.info(`${req.method} ${req.baseUrl} success.`);
});

router.get('/id/:id', async (req, res, next) => {
  try {
    let { id } = req.params;
    id = Number(id);

    if (id < 1) {
      throw new Error(`The 'id' value is not valid.`);
    }

    const { grades } = JSON.parse(await readFile(global.gradesFile));

    const grade = grades.find((grade) => grade.id === id);

    if (!grade) {
      throw new Error('ID not found.');
    }

    res.send(grade);

    logger.info(`${req.method} ${req.baseUrl}${req.url} success.`);
  } catch (err) {
    return next(err);
  }
});

router.delete('/id/:id', async (req, res, next) => {
  try {
    let { id } = req.params;
    id = Number(id);

    if (id < 1 || !id) {
      throw new Error(`The 'id' value is not valid.`);
    }

    const data = JSON.parse(await readFile(global.gradesFile));

    const index = data.grades.findIndex((grade) => grade.id === id);

    if (index < 0) {
      throw new Error('ID not found.');
    }

    data.grades.splice(index, 1);

    await writeFile(global.gradesFile, JSON.stringify(data, null, 2));

    res.status(204).end();

    logger.info(`${req.method} ${req.baseUrl}${req.url} deleted.`);
  } catch (err) {
    return next(err);
  }
});

router.put('/id/:id', async (req, res, next) => {
  try {
    let { id } = req.params;
    let { student, subject, type, value } = req.body;
    id = Number(id);
    student = String(student).trim();
    subject = String(subject).trim();
    type = String(type).trim();
    value = Number(value);

    if (id < 1 || !id) {
      throw new Error(`The 'id' value is not valid.`);
    }

    if (
      !student ||
      student === 'undefined' ||
      !subject ||
      subject === 'undefined' ||
      !type ||
      type === 'undefined' ||
      (!value && value !== 0)
    ) {
      throw new Error(
        `The 'student', 'subject', 'type' and 'value' values are required.`
      );
    }

    const data = JSON.parse(await readFile(global.gradesFile));

    const index = data.grades.findIndex((grade) => grade.id === id);

    if (index < 0) {
      throw new Error('ID not found.');
    }

    data.grades[index].student = student;
    data.grades[index].subject = subject;
    data.grades[index].type = type;
    data.grades[index].value = value;

    await writeFile(global.gradesFile, JSON.stringify(data, null, 2));

    res.send(data.grades[index]);

    logger.info(`${req.method} ${req.baseUrl}${req.url} updated.`);
  } catch (err) {
    return next(err);
  }
});

router.get('/student', async (req, res, next) => {
  try {
    let { student, subject } = req.body;
    student = String(student).trim();
    subject = String(subject).trim();

    if (
      !student ||
      student === 'undefined' ||
      !subject ||
      subject === 'undefined'
    ) {
      throw new Error(`The 'student' and 'subject' values are required.`);
    }

    const { grades } = JSON.parse(await readFile(global.gradesFile));

    const studentGrades = grades.filter((grade) => grade.student === student);

    if (studentGrades.length === 0) {
      throw new Error('Student not found.');
    }

    const subjectGrades = studentGrades.filter(
      (grade) => grade.subject === subject
    );

    if (subjectGrades.length === 0) {
      throw new Error('Subject not found.');
    }

    const gradesSum = subjectGrades.reduce(
      (acc, grade) => (acc += grade.value),
      0
    );

    res.send({ total: gradesSum });

    logger.info(
      `${req.method} ${req.baseUrl}${req.url} '${student}' in '${subject}' total.`
    );
  } catch (err) {
    return next(err);
  }
});

router.get('/subject', async (req, res, next) => {
  try {
    let { subject, type } = req.body;
    subject = String(subject).trim();
    type = String(type).trim();

    if (!type || type === 'undefined' || !subject || subject === 'undefined') {
      throw new Error(`The 'subject' and 'type' values are required.`);
    }

    const { grades } = JSON.parse(await readFile(global.gradesFile));

    const subjectGrades = grades.filter((grade) => grade.subject === subject);

    if (subjectGrades.length === 0) {
      throw new Error('Subject not found.');
    }

    const typeGrades = subjectGrades
      .filter((grade) => grade.type === type)
      .sort((a, b) => b.value - a.value);

    if (typeGrades.length === 0) {
      throw new Error('Type not found.');
    }

    const gradesSum = typeGrades.reduce(
      (acc, grade) => (acc += grade.value),
      0
    );

    const average = gradesSum / typeGrades.length;

    const threeHighestGrades = typeGrades.slice(0, 3);

    res.send({
      average,
      threeHighestGrades,
    });

    logger.info(
      `${req.method} ${req.baseUrl}${req.url} '${subject}' '${type}' average.`
    );
  } catch (err) {
    return next(err);
  }
});

// errors
router.use((err, req, res, _next) => {
  logger.error(`${req.method} ${req.baseUrl}${req.url}: ${err.message}`);

  return res.status(400).send({ error: err.message });
});

export default router;
