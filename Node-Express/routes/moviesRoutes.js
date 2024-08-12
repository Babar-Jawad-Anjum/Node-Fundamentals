const express = require("express");
const {
  getAllMovies,
  createMovie,
  getMovie,
  updateMovie,
  deleteMovie,
  getMovieStats,
  getMovieByGenre,
} = require("../controllers/moviesControllerWithAsyncErrorHandler");
const { protectedRoute, isAuthorized } = require("../middlewares/auth");

const router = express.Router();

router.get("/movie-stats", protectedRoute, getMovieStats);
router.get("/movies-by-genre/:genre", protectedRoute, getMovieByGenre);

//==================================================
router.get("/", protectedRoute, getAllMovies);
router.post("/", protectedRoute, createMovie);
router.get("/:movieId", protectedRoute, getMovie);
router.patch("/:movieId", protectedRoute, isAuthorized("admin"), updateMovie);
router.delete("/:movieId", protectedRoute, isAuthorized("admin"), deleteMovie);
// ====================  Or we can replace above 5 lines to the below 2 lines  ====================================//
// router.route("/").get(getAllMovies).post(createMovie);
// router.route("/:id").get(getMovie).patch(updateMovie).delete(deleteMovie);

module.exports = router;
