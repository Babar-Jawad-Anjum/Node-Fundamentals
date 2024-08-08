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

const router = express.Router();

router.get("/movie-stats", getMovieStats);
router.get("/movies-by-genre/:genre", getMovieByGenre);

//==================================================
router.get("/", getAllMovies);
router.post("/", createMovie);
router.get("/:movieId", getMovie);
router.patch("/:movieId", updateMovie);
router.delete("/:movieId", deleteMovie);
// ====================  Or we can replace above 5 lines to the below 2 lines  ====================================//
// router.route("/").get(getAllMovies).post(createMovie);
// router.route("/:id").get(getMovie).patch(updateMovie).delete(deleteMovie);

module.exports = router;
