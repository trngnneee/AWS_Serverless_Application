import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Welcome to API Server!');
});

app.get('/tasks', (req, res) => {
  res.json({
    code: 200,
    message: 'Tasks retrieved successfully'
  })
})

app.post('/tasks', (req, res) => {
  res.json({
    code: 201,
    message: 'Task created successfully'
  })
})

app.put('/tasks/:id', (req, res) => {
  res.json({
    code: 200,
    message: `Task with id ${req.params.id} updated successfully`
  })
})

app.delete('/tasks/:id', (req, res) => {
  res.json({
    code: 200,
    message: `Task with id ${req.params.id} deleted successfully`
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});