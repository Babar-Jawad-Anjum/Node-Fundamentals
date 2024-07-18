const express = require("express");
const morgan = require("morgan");
const moviesRouter = require("./routes/moviesRoutes");

const app = express();

//Custom Middleware
const logger = function (req, res, next) {
  console.log("Customer middleware called...");
  //next() will go to next handler, if we remove next(), then requ est will stuck here in this function.
  next();
};

app.use(express.json()); //This function express.json() will return a middleware function that will attach the request body(getting from client) to the req object i.e (req,res)
app.use(morgan("dev")); //3rd party library/function which will return a middleware function, this middleware will log information of request in terminal, i.e "GET /api/v1/movies 200 4.608 ms - 266"
app.use(logger); // Adding custom middleware that will execute with every request

// Base route
app.get("/", (req, res) => {
  res.send("Hello from Node-Express Server...");
});

//Movies routes handler
app.use("/api/v1/movies", moviesRouter);

// ====================  App Routes  ====================================//
// app.get("/api/v1/movies", getAllMovies);
// app.get("/api/v1/movies/:movieId", getMovie);
// app.post("/api/v1/movies", createMovie);
// app.patch("/api/v1/movies/:movieId", updateMovie);
// app.delete("/api/v1/movies/:movieId", deleteMovie);

//As we see that some methods have same route i.e /api/v1/movies so we can simplify above all routes to the below
// app.route("/api/v1/movies").get(getAllMovies).post(createMovie);
// app
//   .route("/api/v1/movies/:movieId")
//   .get(getMovie)
//   .patch(updateMovie)
//   .delete(deleteMovie);

// ====================  Mounting Routes  ====================================//
// const movieRouter = express.Router();

// movieRouter.get("/", getAllMovies);
// movieRouter.post("/", createMovie);
// movieRouter.patch("/:id", updateMovie);
// movieRouter.get("/:id", getMovie);
// movieRouter.delete("/:id", deleteMovie);

// --------- OR we can covert above 5 lines to below 2 lines

// movieRouter.route("/").get(getAllMovies).post(createMovie);
// movieRouter.route("/:id").get(getMovie).patch(updateMovie).delete(deleteMovie);

// app.use("/api/v1/movies", movieRouter);

app.listen("3000", () => {
  console.log("Server running on port 3000");
});
