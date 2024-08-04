const Movie = require("../Models/movieModel");
const ApiFeatures = require("../Utils/ApiFeatures");

// ===================================================================================================//
//                 Handlers that used mongoDb to save, read, update or delete record                     //
// ===================================================================================================//

exports.getAllMovies = async (req, res) => {
  try {
    let allMovies;

    //if there is query string, filter data according to that, else fetch all records
    if (Object.keys(req.query).length !== 0) {
      //<<<<< ============ Scenario-1 - get Movies of certain duration and ratings ================ >>>>>
      //
      //
      //
      // allMovies = await Movie.find({
      //   duration: req.query.duration,
      //   ratings: req.query.ratings,
      // });
      ////another way of above lines, because req.query is also object {duration: 154, ratings: 8.9}
      // allMovies = await Movie.find(req.query);
      ////======= Another filter (Movies whose duration should be greater than or equal to 90 and ratings greater than or equal to 4.0) ======= //
      // allMovies = await Movie.find({
      //   duration: { $gte: 90 },
      //   ratings: { $gte: 4.0 },
      // });
      //
      //
      //
      //<<<<< ============ Scenario-2 - sort movies by anything sent in query params i.e price ================ >>>>>
      //
      //
      //
      // if (req.query.sort) {
      // query = Movie.find(); // no await keyword here, so it will returns query
      // query = query.sort(req.query.sort);
      // allMovies = await query;
      ////Now if we want to sort results by more than one option, i.e price, ratings so for that
      // query = Movie.find(); // no await keyword here, so it will returns query
      // sortBy = req.query.sort.split(",").join(" ");
      // query = query.sort(sortBy);
      // allMovies = await query;
      // }
      //
      //
      //
      //<<<<< ============ Scenario-3 - Pagination ================ >>>>>
      //
      //
      //
      // if (req.query.page && req.query.limit) {
      //   const page = +req.query.page;
      //   const limit = +req.query.limit;
      //   const skip = (page - 1) * limit;
      //   query = Movie.find(); // no await keyword here, so it will returns query
      //   query = query.skip(skip).limit(limit);
      //   allMovies = await query;
      // }
      //
      //
      // we can also use paginate method  of reusable class from Utils directory
      const moviesQuery = new ApiFeatures(Movie.find(), req.query).paginate();
      allMovies = await moviesQuery.query;
    } else {
      allMovies = await Movie.find();
    }

    res.status(200).json({
      status: "success",
      length: allMovies.length,
      data: {
        movies: allMovies,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getMovie = async (req, res) => {
  try {
    // const movie = await Movie.find({ _id: req.params.movieId });
    const movie = await Movie.findById(req.params.movieId);

    res.status(200).json({
      status: "success",
      data: {
        movie: movie,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        movie: movie,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.movieId,
      req.body,
      // { new: true, runValidators: true } the first option will return modified document, and second will run validators/schema because in update, validators will not by default.
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        movie: updatedMovie,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.movieId);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

//handler for aggregation pipeline, we can use use aggregation pipeline to
//calculate aggregation like averages, count, sum , min or max
exports.getMovieStats = async (req, res) => {
  try {
    //aggregation is a mongodb feature
    const stats = await Movie.aggregate([
      //Stage-1: match
      { $match: { ratings: { $gte: 2 } } },
      //Stage-2: group
      {
        $group: {
          _id: "$releaseYear", //=============== We want to group movies based on releaseYear i.e 2 movies released in 2013 etc, Grouping will be done based on what we mention in _id
          avgRating: { $avg: "$ratings" }, //=== Calculate avg rating of movies from getting in Stage-1
          avgPrice: { $avg: "$price" }, //====== Calculate avg Price of movies from getting in Stage-1
          minPrice: { $min: "$price" }, //====== Calculate min price of movie from data getting in Stage-1
          maxPrice: { $max: "$price" }, //====== Calculate max price of movie from data getting in Stage-1
          priceTotal: { $sum: "$price" }, //==== Calculate sum of price of all movies from data getting in Stage-1
          movieCount: { $sum: 1 }, //=========== Calculate total number of movies on which this aggregation happening
        },
      },
      //Stage-3: sort
      { $sort: { minPrice: 1 } }, //============ Sort by minPrice in asc order, remember this sorting stage will apply to results of above 2 stages
    ]);
    res.status(200).json({
      status: "success",
      count: stats.length,
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

// ===================================================================================================================//
//                 Handlers that used file handling to save, read, update or delete record in file                    //
// ===================================================================================================================//

// const fs = require("fs");

//Not a good practice, because the callback will be executed by event loop and readFileSync will block the event loop
// let movies = JSON.parse(fs.readFileSync("./data/movies.json"));

// exports.getAllMovies = (req, res) => {f
//   //================================== =======================//
//   //       Send data back to client in JSend Json Format      //
//   //==========================================================//
//   res.status(200).json({
//     status: "success",
//     count: movies.length,
//     data: {
//       movies: movies,
//     },
//   });
// };

// exports.getMovie = (req, res) => {
//   //Convert movieId to number type which is string originally
//   let movieId = +req.params.movieId;

//   let movie = movies.find((movie) => movie.id === movieId);

//   //==========================================================//
//   //       Send data back to client in JSend Json Format      //
//   //==========================================================//
//   if (movie) {
//     res.status(200).json({
//       status: "success",
//       data: {
//         movie: movie,
//       },
//     });
//   } else {
//     res.status(404).json({
//       status: "fail",
//       message: `OOPS! Movie with id ${req.params.movieId} not found.`,
//     });
//   }
// };

// exports.createMovie = (req, res) => {
//   let newMovieId = movies[movies.length - 1].id + 1;

//   let newMovie = Object.assign({ id: newMovieId }, req.body);

//   movies.push(newMovie);

//   fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
//     //==========================================================//
//     //       Send data back to client in JSend Json Format      //
//     //==========================================================//
//     res.status(201).json({
//       status: "success",
//       data: {
//         movie: newMovie,
//       },
//     });
//   });
// };

// exports.updateMovie = (req, res) => {
//   //Convert movieId to number type which is string originally
//   let movieId = +req.params.movieId;

//   let movieToUpdate = movies.find((movie) => movie.id === movieId);

//   //If movie not exist of given id
//   if (!movieToUpdate) {
//     res.status(404).json({
//       status: "fail",
//       message: `OOPS! Movie with id ${req.params.movieId} not found.`,
//     });
//   }

//   //Find Index of movie so that we can replace updated movie at where it was be
//   let movieIndex = movies.indexOf(movieToUpdate);

//   //Object.assign, what it will do is, it will merge two objects and whatever key value 2nd object has, it will update that part from the first object during merge
//   let updatedMovie = Object.assign(movieToUpdate, req.body);

//   //Place updatedMovie at index where it was be
//   movies[movieIndex] = updatedMovie;

//   fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
//     //==========================================================//
//     //       Send data back to client in JSend Json Format      //
//     //==========================================================//
//     res.status(200).json({
//       status: "success",
//       data: {
//         movie: updatedMovie,
//       },
//     });
//   });
// };

// exports.deleteMovie = (req, res) => {
//   //Convert movieId to number type which is string originally
//   let movieId = +req.params.movieId;

//   let isMovieExist = movies.find((movie) => movie.id === movieId);

//   //If movie not exist of given id
//   if (!isMovieExist) {
//     res.status(404).json({
//       status: "fail",
//       message: `OOPS! Movie with id ${req.params.movieId} not found.`,
//     });
//   }

//   let filteredMovies = movies.filter((movie) => movie.id !== movieId);

//   fs.writeFile("./data/movies.json", JSON.stringify(filteredMovies), (err) => {
//     //==========================================================//
//     //       Send data back to client in JSend Json Format      //
//     //==========================================================//
//     res.status(204).json({
//       status: "success",
//       data: {
//         movie: null,
//       },
//     });
//   });
// };
