const fs = require("fs");

//Not a good practice, because the callback will be executed by event loop and readFileSync will block the event loop
let movies = JSON.parse(fs.readFileSync("./data/movies.json"));

//ROUTE HANDLERS
exports.getAllMovies = (req, res) => {
  //================================== =======================//
  //       Send data back to client in JSend Json Format      //
  //==========================================================//
  res.status(200).json({
    status: "success",
    count: movies.length,
    data: {
      movies: movies,
    },
  });
};

exports.getMovie = (req, res) => {
  //Convert movieId to number type which is string originally
  let movieId = +req.params.movieId;

  let movie = movies.find((movie) => movie.id === movieId);

  //================================== =======================//
  //       Send data back to client in JSend Json Format      //
  //==========================================================//
  if (movie) {
    res.status(200).json({
      status: "success",
      data: {
        movie: movie,
      },
    });
  } else {
    res.status(404).json({
      status: "fail",
      message: `OOPS! Movie with id ${req.params.movieId} not found.`,
    });
  }
};

exports.createMovie = (req, res) => {
  let newMovieId = movies[movies.length - 1].id + 1;

  let newMovie = Object.assign({ id: newMovieId }, req.body);

  movies.push(newMovie);

  fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
    //==========================================================//
    //       Send data back to client in JSend Json Format      //
    //==========================================================//
    res.status(201).json({
      status: "success",
      data: {
        movie: newMovie,
      },
    });
  });
};

exports.updateMovie = (req, res) => {
  //Convert movieId to number type which is string originally
  let movieId = +req.params.movieId;

  let movieToUpdate = movies.find((movie) => movie.id === movieId);

  //If movie not exist of given id
  if (!movieToUpdate) {
    res.status(404).json({
      status: "fail",
      message: `OOPS! Movie with id ${req.params.movieId} not found.`,
    });
  }

  //Find Index of movie so that we can replace updated movie at where it was be
  let movieIndex = movies.indexOf(movieToUpdate);

  //Object.assign, what it will do is, it will merge two objects and whatever key value 2nd object has, it will update that part from the first object during merge
  let updatedMovie = Object.assign(movieToUpdate, req.body);

  //Place updatedMovie at index where it was be
  movies[movieIndex] = updatedMovie;

  fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
    //==========================================================//
    //       Send data back to client in JSend Json Format      //
    //==========================================================//
    res.status(200).json({
      status: "success",
      data: {
        movie: updatedMovie,
      },
    });
  });
};

exports.deleteMovie = (req, res) => {
  //Convert movieId to number type which is string originally
  let movieId = +req.params.movieId;

  let isMovieExist = movies.find((movie) => movie.id === movieId);

  //If movie not exist of given id
  if (!isMovieExist) {
    res.status(404).json({
      status: "fail",
      message: `OOPS! Movie with id ${req.params.movieId} not found.`,
    });
  }

  let filteredMovies = movies.filter((movie) => movie.id !== movieId);

  fs.writeFile("./data/movies.json", JSON.stringify(filteredMovies), (err) => {
    //==========================================================//
    //       Send data back to client in JSend Json Format      //
    //==========================================================//
    res.status(204).json({
      status: "success",
      data: {
        movie: null,
      },
    });
  });
};
