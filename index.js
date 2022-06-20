const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ message: 'O campo "email" é obrigatório' });
  }

  if (!(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(email)) {
    return res
      .status(400)
      .json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }

  next();
};

const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res
      .status(400)
      .json({ message: 'O campo "password" é obrigatório' });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }

  next();
};

const validateToken = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }

  if (authorization.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  next();
};

const validateName = (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ message: 'O campo "name" é obrigatório' });
  }

  if (name.length < 3) {
    return res
      .status(400)
      .json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }

  next();
};

const validateAge = (req, res, next) => {
  const { age } = req.body;

  if (!age) {
    return res
      .status(400)
      .json({ message: 'O campo "age" é obrigatório' });
  }

  if (Number(age) < 18) {
    return res
      .status(400)
      .json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }

  next();
};

const validateWatchedAt = (req, res, next) => {
  const { talk: { watchedAt } } = req.body;

  if (!watchedAt) {
    return res
      .status(400)
      .json({ message: 'O campo "watchedAt" é obrigatório' });
  }

  if (!/^(0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-]\d{4}$/
    .test(watchedAt)) {
      return res
        .status(400)
        .json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
    }

  next();
};

const validateRate = (req, res, next) => {
  const { talk: { rate } } = req.body;

  if (!rate) {
    return res
      .status(400)
      .json({ message: 'O campo "rate" é obrigatório' });
  }

  if (!(rate >= 1 && rate <= 5)) {
    return res
      .status(400)
      .json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }

  next();
};

const validateTalk = (req, res, next) => {
  const { talk } = req.body;

  if (!talk) {
    return res
      .status(400)
      .json({ message: 'O campo "talk" é obrigatório' });
  }

  next();
};

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
      .readFile('./talker.json', 'utf8');
  
    const jsonRegisteredPeople = JSON.parse(registeredPeople);
    const registeredPerson = req.body;
    const id = jsonRegisteredPeople.length + 1;

    jsonRegisteredPeople.push({ id, ...registeredPerson });

    await fs.writeFile('./talker.json', JSON.stringify(jsonRegisteredPeople));

    res.status(201).json(jsonRegisteredPeople[id - 1]);
});

app.listen(PORT, () => {
  console.log(`Online na porta ${PORT}`);
});
