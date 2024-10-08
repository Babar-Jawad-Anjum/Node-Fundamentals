const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const CustomError = require("./Utils/CustomError");
const globalErrorHandler = require("./controllers/errorController");

const moviesRouter = require("./routes/moviesRoutes");
const authRouter = require("./routes/authRoutes");

const rateLimit = require("express-rate-limit");

// =========================================================================//
//        Whatever variables we defined in config.env, those                //
//        will be saved in the Node.js environment variables                //
// =========================================================================//
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" }); //.env file on root
// console.log(process.env);

const app = express();

// =========================================================================//
//                           Custom Middleware                              //
// =========================================================================//
const logger = function (req, res, next) {
  console.log("Custom middleware called...");
  //next() will go to next handler, if we remove next(), then requ est will stuck here in this function.
  next();
};

const limiter = rateLimit({
  max: 4, //Number of request allowed
  windowMs: 60 * 60 * 1000, // Time frame - within an hour, max 60 requests allowed
  message:
    "We have received to many requests from this IP. Please try again after 1 hours",
});
app.use("/api", limiter);

app.use(express.json()); //This function express.json() will return a middleware function that will attach the request body(getting from client) to the req object i.e (req,res)
app.use(morgan("dev")); //3rd party library/function which will return a middleware function, this middleware will log information of request in terminal, i.e "GET /api/v1/movies 200 4.608 ms - 266"
app.use(express.static("./public")); // This express.static() will return middleware function that will serve static files inside public folder
app.use(logger); // Adding custom middleware that will execute with every request

// Base route
app.get("/", (req, res) => {
  res.send("Hello from Node-Express Server...");
});

//Movies routes handler
app.use("/api/v1/movies", moviesRouter);
//Auth routes handler
app.use("/api/v1/users", authRouter);

//Default router handler
app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `can't find ${req.originalUrl} on the server!`,
  // });
  //====================================================================
  // const err = new Error(`can't find ${req.originalUrl} on the server!`);
  // err.status = "fail";
  // err.statusCode = 404;
  // next(err);
  //====================================================================
  const err = new CustomError(
    `can't find ${req.originalUrl} on the server!`,
    404
  );
  next(err);
});

// =========================================================================//
//                              App Routes                                  //
// =========================================================================//
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

// =========================================================================//
//                           Mounting Routes                                //
// =========================================================================//
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
//==========================================================================================================

// ============================================================================//
//                    Global Error handling middleware                         //
// ============================================================================//
app.use(globalErrorHandler);

// ============================================================================//
//                           MongoDB Connection                                //
// ============================================================================//
mongoose
  .connect(process.env.LOCAL_CONN_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    console.log(`
      
   // ========================================================//
   //               Connected to Db successfully              //
   // ========================================================//
   
   `);
  })
  .catch((error) => {
    console.log("Error! Failed connection to DB...");
  });

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});
