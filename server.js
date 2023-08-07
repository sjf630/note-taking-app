const express = require('express');
const path = require('path');
const fs = require('fs');
const uniqid = require('uniqid');

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const routes = {
  notes: '/notes',
  root: '/',
  apiNotes: '/api/notes',
};

const handlers = {
  sendFile: (filePath) => (req, res) => res.sendFile(path.join(__dirname, filePath)),
  readAndSendJSON: (filePath) => (req, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const notes = JSON.parse(data);
        res.status(200).json(notes);
        console.log(`${req.method} request received to get note`);
      }
    });
  },
};

app.get(routes.notes, handlers.sendFile('/public/notes.html'));
app.get(routes.root, handlers.sendFile('/public/index.html'));
app.get(routes.apiNotes, handlers.readAndSendJSON('./db/db.json'));

app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;

  if (!title || !text) {
    res.status(500).json('Error in posting review');
    return;
  }

  const newNote = {
    title,
    text,
    id: uniqid(),
  };

  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const parsedNote = JSON.parse(data);
    parsedNote.push(newNote);

    fs.writeFile(
      './db/db.json',
      JSON.stringify(parsedNote, null, 4),
      (writeErr) => writeErr ? console.error(writeErr) : console.info('Successfully updated notes!')
    );

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  });
});

app.delete('/api/notes/:id', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    const notes = JSON.parse(data); 
    const filteredNotes = notes.filter(note => note.id !== req.params.id);

    fs.writeFile('./db/db.json', JSON.stringify(filteredNotes), err => { 
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }

      res.sendStatus(200);
    });
  });
});

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));
