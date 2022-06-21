const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');
const {
  validateEmail,
  validatePassword,
  validateToken,
  validateName,
  validateAge,
  validateWatchedAt,
  validateRate,
  validateTalk,
  validateSearchName,
} = require('./validates');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const FILE_NAME = './talker.json';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker/search', validateToken, validateSearchName, async (req, res) => {
  const { q } = req.query;
  const registeredPeople = await fs.readFile(FILE_NAME, 'utf-8');
  const jsonRegisteredPeople = JSON.parse(registeredPeople);

  const response = jsonRegisteredPeople
    .filter((person) => person.name.includes(q));

  await fs.writeFile(FILE_NAME, JSON.stringify(response));

  res.status(200).json(response);
});

app.get('/talker', async (_req, res) => {
  const registeredPeople = await fs
    .readFile(FILE_NAME, 'utf8');
  
  const jsonRegisteredPeople = JSON.parse(registeredPeople);

  res.status(200).json(jsonRegisteredPeople);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const registeredPeople = await fs
    .readFile(FILE_NAME, 'utf8');
  
  const jsonRegisteredPeople = JSON.parse(registeredPeople);

  const registeredPerson = jsonRegisteredPeople
    .find((person) => person.id === Number(id));
  
  if (registeredPerson) {
    return res.status(200).json(registeredPerson);
  }

  res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
});

app.post('/login', validateEmail, validatePassword, async (_req, res) => {
  const token = crypto.randomBytes(8).toString('hex');

  res.status(200).json({ token });
});

app.post('/talker',
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
  async (req, res) => {
    const registeredPeople = await fs
      .readFile(FILE_NAME, 'utf8');
  
    const jsonRegisteredPeople = JSON.parse(registeredPeople);
    const registeredPerson = req.body;
    const id = jsonRegisteredPeople.length + 1;

    jsonRegisteredPeople.push({ id, ...registeredPerson });

    await fs.writeFile(FILE_NAME, JSON.stringify(jsonRegisteredPeople));

    res.status(201).json(jsonRegisteredPeople[id - 1]);
});

app.put('/talker/:id',
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
  async (req, res) => {
    const registeredPeople = await fs
      .readFile(FILE_NAME, 'utf8');
  
    const jsonRegisteredPeople = JSON.parse(registeredPeople);
    const { id } = req.params;
    const actualPerson = req.body;

    jsonRegisteredPeople.splice(Number(id) - 1, 1, { id: Number(id), ...actualPerson });

    await fs.writeFile(FILE_NAME, JSON.stringify(jsonRegisteredPeople));

    res.status(200).json({ id: Number(id), ...actualPerson });
});

app.delete('/talker/:id', validateToken, async (req, res) => {
  const { id } = req.params;

  const registeredPeople = await fs.readFile(FILE_NAME, 'utf-8');
  const jsonRegisteredPeople = JSON.parse(registeredPeople);

  const actualPeople = jsonRegisteredPeople
    .filter((person) => person.id !== Number(id));

  await fs.writeFile(FILE_NAME, JSON.stringify(actualPeople));

  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Online na porta ${PORT}`);
});
