const express = require("express");
const app = express();
require('dotenv').config()
const port = process.env.PORT;


const bodyParser = require("body-parser");
const userRouter = require("./src/routes/user.routes");
const authRoutes = require("./src/routes/auth.routes");
const mealRoutes = require("./src/routes/meal.routes");

app.use(bodyParser.json());

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

app.use('/api', userRouter);
app.use('/api', authRoutes);
app.use('/api', mealRoutes);

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

//error handler
app.use((err, req, res, next) =>{
  console.log('Error: ' + err.toString())
  res.status(500).json({
    statusCode : 500,
    message : err.toString(),
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;