const express = require('express');
const cors = require('cors');

const { v4: uuidV4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [{
  id: uuidV4(),
  name: "fulano",
  username: "fulano",
  todos: []
}];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find(o => o.username === username);

  if(!user) {
    return response.status(400).json({
      error: 'user not exists',
    })
  }

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if(users.find(user => user.username  === username )) {
    return response.status(400).json({
      error: 'Mensagem do erro',
    })
  }

  const user = {
    id: uuidV4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.user;

  const todo = { 
    id: uuidV4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  users = users.map(o => o.id === user.id ? { ...o, todos: [...o.todos, todo] } : o);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;
  const { title, deadline } = request.body;
  let updatedTodo

  users = users.map(o => {
    if(o.id === user.id) {
      o.todos = o.todos.map(todo => {
        if(todo.id === id) {
          updatedTodo = {
            ...todo,
            title,
            deadline,
          }

          return updatedTodo
        }

        return todo
      })
    }

    return o
  });

  if(!updatedTodo) {
    return response.status(404).json({
      error: 'Mensagem do erro',
    });
  }

  return response.status(201).json(updatedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;
  let updatedTodo

  users = users.map(o => {
    if(o.id === user.id) {
      o.todos = o.todos.map(todo => {
        if(todo.id === id) {
          updatedTodo = {
            ...todo,
            done: true,
          }

          return updatedTodo
        }
        return todo;
      })
    }

    return o
  });

  if(!updatedTodo) {
    return response.status(404).json({
      error: 'Mensagem do erro',
    });
  }

  return response.status(200).json(updatedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;
  const previosTodosQuantity = user.todos.length

  users = users.map(o => {
    if(o.id === user.id) {
      o.todos = o.todos.filter(todo => todo.id !== id)
    }

    return o
  });

  if(previosTodosQuantity === user.todos.length) {
    return response.status(404).json({
      error: 'Mensagem do erro',
    });
  }

  return response.status(204).send();
});

module.exports = app;