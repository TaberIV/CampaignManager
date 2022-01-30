const express = require('express');
const { startBot } = require('./app.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Campaign Manager is running');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

startBot()