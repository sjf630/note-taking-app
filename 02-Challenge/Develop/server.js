const express = require('express');
const path = require('path');
const fs = require('fs');
const uniqid = require('uniqid')

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err)
        } else {
            const notes = JSON.parse(data);
            res.status(200).json(notes);
            console.log(`${req.method} request received to get note`)
        }
    })
})

app.post('/api/notes', (req, res) => {

    console.info(`${req.method} request received to add note`);

    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uniqid() // this is creating a new and unique id for every different note that is saved
        }
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                // Convert string into JSON object
                const parsedNote = JSON.parse(data);

                // Add a new note
                parsedNote.push(newNote);

                // Write updated post back to the file
                fs.writeFile(
                    './db/db.json',
                    JSON.stringify(parsedNote, null, 4),
                    (writeErr) =>
                        writeErr
                            ? console.error(writeErr)
                            : console.info('Successfully updated notes!')
                );
            }
        });
        const response = {
            status: 'success',
            body: newNote,
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting review');
    }
})

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

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);
