//==================================================================================================================
//       This file doesn't belong to this project, this is just a file to import or delete data from db
//==================================================================================================================

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Movie = require("./../Models/movieModel");

dotenv.config({ path: "./.env" });

mongoose
  .connect(process.env.LOCAL_CONN_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    console.log(`Connected to Db successfully`);
  })
  .catch((error) => {
    console.log("Error! Failed connection to DB...");
  });

//READ Movies.json FILE
const movies = JSON.parse(fs.readFileSync("./data/movies.json", "utf-8"));

const deleteMovies = async () => {
  try {
    await Movie.deleteMany();
    console.log("Data Deleted Successfully");
  } catch (err) {
    console.log(err.message);
  }
  //exit the process mean stop server
  process.exit();
};
const importMovies = async () => {
  try {
    await Movie.create(movies);
    console.log("Data Imported Successfully");
  } catch (err) {
    console.log(err.message);
  }
  //exit the process mean stop server
  process.exit();
};

//when we run the file i.e 'node data/import-dev-data.js --import' from CLI
if (process.argv[2] === "--import") {
  importMovies();
}
//when we run the file i.e 'node data/import-dev-data.js --delete' from CLI
if (process.argv[2] === "--delete") {
  deleteMovies();
}
