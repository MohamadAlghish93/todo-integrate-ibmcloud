const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = 80;

app.use(cors());
app.use(bodyParser.json());



// 1 // connect to MongoDB from our server program by using the Mongoose library

const uri = "mongodb+srv://admin:admin@cluster0-wmdae.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

// 2 // To access the MongoDB database by using the Todo schema
let Todo = require('./todo.model');

// 3 // 
const todoRoutes = express.Router();

// router will be added as a middleware and will take control of request starting with path /todos
app.use('/todos', todoRoutes);

//endpoint delivering all available todos items
todoRoutes.route('/').get(function(req, res) {
    // retrieve a list of all todo items from the MongoDB database
    // find method takes one argument: a callback function 
    // which is executed once the result is available.
    Todo.find(function(err, todos) {
        if (err) {
            console.log(err);
        } else {
            res.json(todos);
        }
    });
});

// retrieve a todo item by providing an ID
todoRoutes.route('/:id').get(function(req, res) {
    let id = req.params.id;
    Todo.findById(id, function(err, todo) {
        res.json(todo);
    });
});

// add new todo items
todoRoutes.route('/add').post(function(req, res) {
    let todo = new Todo(req.body);
    todo.save()
        .then(todo => {
            res.status(200).json({ 'todo': 'todo added successfully' });
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
        });
});

// update an existing todo item
todoRoutes.route('/update/:id').post(function(req, res) {
    Todo.findById(req.params.id, function(err, todo) {
        if (!todo)
            res.status(404).send("data is not found");
        else
            todo.todo_description = req.body.todo_description;
        todo.todo_responsible = req.body.todo_responsible;
        todo.todo_priority = req.body.todo_priority;
        todo.todo_completed = req.body.todo_completed;

        todo.save().then(todo => {
                res.json('Todo updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});


app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});