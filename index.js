require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const Person = require('./models/person');

app.use(cors());
app.use(express.json());

/* morgan.token('body', function (req, res) { //USED FOR CUSTOM TO VIEW REQ BODY BUT NOT RECOMMENDED FOR SENSITIVE, HENCE WHY COMMENTED OUT
  return JSON.stringify(req.body);
});
 app.use(morgan('method :url :status :res[content-length] - :response-time ms :body')); */
app.use(morgan('tiny'));

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  next(error);
};

const baseUrl = '/api/persons';

app.get('/', (request, response) => {
  response.send('<h1>...</h1>');
});
app.get(baseUrl, (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});
app.get('/info', (request, response) => {
  Person.find({}).then((peeps) => {
    const persons = peeps;

    response.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`);
  });
});

app.get(`${baseUrl}/:id`, (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.delete(`${baseUrl}/:id`, (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.put(`${baseUrl}/:id`, (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.post(baseUrl, (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ error: 'name missing' });
  }
  if (!body.number) {
    return response.status(400).json({ error: 'number missing' });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
