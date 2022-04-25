const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

let database = [];
let userDatabase = [];
let id = 0;

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});

app.post("/api/movie", (req, res) => {
  let movie = req.body;
  id++;
  movie = {
    id,
    ...movie,
  };
  console.log(movie);
  database.push(movie);
  res.status(201).json({
    status: 201,
    result: database,
  });
});

app.get("/api/movie/:movieId", (req, res, next) => {
  const movieId = req.params.movieId;
  console.log(`Movie met ID ${movieId} gezocht`);
  let movie = database.filter((item) => item.id == movieId);
  if (movie.length > 0) {
    console.log(movie);
    res.status(200).json({
      status: 200,
      result: movie,
    });
  } else {
    res.status(404).json({
      status: 404,
      result: `Movie with ID ${movieId} not found`,
    });
  }
});

app.get("/api/movie", (req, res, next) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

app.get("/api/user", (req, res) => {
  res.status(300).json({
    status: 300,
    result: userDatabase,
  });
});

app.post("/api/user", (req, res) => {
  let user = req.body;
  user = {
    id,
    ...user,
  };
  id++;
  console.log(user);
  userDatabase.push(user);
  res.status(301).json({
    status: 301,
    result: userDatabase,
  });
});

app.get("/api/user/:userId", (req, res) => {
  const userId = req.params.userId;
  console.log(`User met ID ${userId} gezocht`);
  let user = userDatabase.filter((item) => item.id == userId);
  if(user.length > 0){
    console.log(user);
    res.status(300).json({
      status : 300,
      result: user,
    });
  } else {
    res.status(404).json({
      status: 404,
      result: `User with Id ${userId} is not found`
    });
  }
});

app.put("/api/user/:userId", (req, res) => {
  const userId = req.params.userId;

  console.log(`User met ID ${userId} gezocht`);
  let oldUser = userDatabase.filter((item) => item.id == userId);
  if(oldUser.length > 0){
    console.log(oldUser);
    elementIndex = userDatabase.findIndex((obj => obj.id == userId));
    
    let user = req.body;
    newUser = {
      id,
      ...user,
    } 
    userDatabase[elementIndex] = newUser;

    res.status(302).json({
      status: 302,
      result: userDatabase,
    });
  } else {
    res.status(404).json({
      status: 404,
      result: `User with Id ${userId} is not found`
    });
  }
});

app.delete("/api/user/:userId", (req, res) => {
  const userId = req.params.userId;
  console.log(`User met ID ${userId} gezocht`);
  let user = userDatabase.filter((item) => item.id == userId);
  if(user.length > 0){
    console.log(userDatabase[userId]);

    const index = userDatabase.indexOf(user);
    userDatabase.splice(index, 1);
    res.status(303).json({
      status: 303,
      result: userDatabase,
    });
  } else {
    res.status(404).json({
      status: 404,
      result: `User with Id ${userId} is not found`
    });
  }
});

app.all("*", (req, res) => {
  res.status(404).json({
    status: 404,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


