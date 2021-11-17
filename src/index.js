const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  if(!username) {
    return response.json({error: 'Insira um nome de usuário no header'})
  }
  const user = users.find((user) => user.username === username)
  if(!user) {
    return response.json({error: 'Usuário não existe'})
  }
  request.todos = user.todos
  return next()

}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const existingUser = users.find((user) => user.username === username)
  if(existingUser) {
    return response.status(400).json({error: 'Esse usuário já existe'})
  }
  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })
  const newUser =  users.find((user) => user.username === username)
  return response.json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.json(request.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const id = uuidv4()
  request.todos.push({
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  })
  const newTodo = request.todos.find((todo) => todo.id === id)
  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const { id } = request.params
  const todoToUpdate = request.todos.find((todo) => todo.id === id)
  if(!todoToUpdate) {
    return response.status(404).json({error: 'Não é possível atualizar um todo não existente'})
  }
  todoToUpdate.title = title
  todoToUpdate.deadline = deadline
  return response.json(todoToUpdate)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const todoToUpdate = request.todos.find((todo) => todo.id === id)
  if(!todoToUpdate) {
    return response.status(404).json({error: 'Todo não encontrado'})
  }
  todoToUpdate.done = true
  return response.json(todoToUpdate)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const todoToDelete = request.todos.findIndex((todo) => todo.id === id)
  if(todoToDelete == -1) {
    return response.status(404).json({error: 'Não é possível excuir um Todo inexistente'})
  }
  request.todos.splice(todoToDelete, 1)
  return response.status(204).json({message: 'Success'})
});

module.exports = app;