const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(bodyParser.json());

// Helper function to read users
const getUsers = () => {
    if (!fs.existsSync(USERS_FILE)) {
        return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
};

// Helper function to write users
const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
};

// Signup Door
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();

    if (users.find(user => user.username === username)) {
        return res.status(400).send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    saveUsers(users);

    res.status(201).send('User registered successfully');
});

// Login Door
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(400).send('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).send('Invalid username or password');
    }

    res.status(200).send('Login successful');
});

app.listen(PORT, () => {
    console.log(`Gatekeeper App listening on port ${PORT}`);
});
