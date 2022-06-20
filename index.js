const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (req, res) => {
  const registeredPeople = await fs
    .readFile('./talker.json', 'utf8');
  
  const jsonRegisteredPeople = JSON.parse(registeredPeople);

  res.status(200).json(jsonRegisteredPeople);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const registeredPeople = await fs
    .readFile('./talker.json', 'utf8');
  
  const jsonRegisteredPeople = JSON.parse(registeredPeople);

  const registeredPerson = jsonRegisteredPeople
    .find((person) => person.id === Number(id))
  
  if (registeredPerson) {
    return res.status(200).json(registeredPerson);
  }

  res.status(404).json({ "message": "Pessoa palestrante não encontrada" });  
});

app.post('/login', async (_req, res) => {
  const token = crypto.randomBytes(8).toString('hex');

  res.status(200).json({ token });
});

app.listen(PORT, () => {
  console.log('Online');
});
