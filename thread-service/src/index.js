import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'thread' });
});

app.listen(port, () => {
  console.log(`Thread service listening on port ${port}`);
});
