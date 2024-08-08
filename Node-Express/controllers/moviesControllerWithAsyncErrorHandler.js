// ===================================================================================================//
//                                                                                                    //
//                 this is same file as moviesController with                                         //
//                 asyncErrorHandler i.e global error handler technique                               //
//                                                                                                    //
// ===================================================================================================//

const Movie = require("../Models/movieModel");
const ApiFeatures = require("../Utils/ApiFeatures");
const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const CustomError = require("../Utils/CustomError");

exports.getAllMovies = asyncErrorHandler(async (req, res, next) => {
  let allMovies;

  //if there is query string, filter data according to that, else fetch all records
  if (Object.keys(req.query).length !== 0) {
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
});

exports.getMovie = asyncErrorHandler(async (req, res, next) => {
  // const movie = await Movie.find({ _id: req.params.movieId });
  const movie = await Movie.findById(req.params.movieId);

  //Handling not found, sort of thing
  if (!movie) {
    const error = new CustomError("Movie with that ID is not found!", 404);
    return next(error);
  }

  res.status(200).json({
    status: "success",
    data: {
      movie: movie,
    },
  });
});

exports.createMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      movie: movie,
    },
  });
});

exports.updateMovie = asyncErrorHandler(async (req, res) => {
  const updatedMovie = await Movie.findByIdAndUpdate(
    req.params.movieId,
    req.body,
    // { new: true, runValidators: true } the first option will return modified document, and second will run validators/schema because in update, validators will not by default.
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedMovie) {
    const error = new CustomError("Movie with that ID is not found!", 404);
    return next(error);
  }

  res.status(200).json({
    status: "success",
    data: {
      movie: updatedMovie,
    },
  });
});

exports.deleteMovie = asyncErrorHandler(async (req, res) => {
  const deletedMovie = await Movie.findByIdAndDelete(req.params.movieId);
  if (!deletedMovie) {
    const error = new CustomError("Movie with that ID is not found!", 404);
    return next(error);
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

//handler for aggregation pipeline, we can use use aggregation pipeline to
//calculate aggregation like averages, count, sum , min or max
exports.getMovieStats = asyncErrorHandler(async (req, res) => {
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
});

//handler for aggregation pipeline, getAllMovies of given genre in params
exports.getMovieByGenre = asyncErrorHandler(async (req, res) => {
  const genre = req.params.genre;
  const movies = await Movie.aggregate([
    //Stage-1
    { $unwind: "$genres" },
    //Stage-2
    {
      $group: {
        _id: "$genres",
        movieCount: { $sum: 1 },
        movies: { $push: "$name" },
      },
    },
    //Stage-3
    { $addFields: { genre: "$_id" } },
    //Stage-4, remove _id from results because we replace _id with genre in previous stage i.e Stage-3
    { $project: { _id: 0 } },
    //Stage-5, sort data by desc order by movieCount field
    { $sort: { movieCount: -1 } },
    //State-6, send only that document whose genre match with genre getting in params
    { $match: { genre: genre } },
  ]);

  res.status(200).json({
    status: "success",
    count: movies.length,
    data: {
      movies,
    },
  });
});
