const mongoose = require("mongoose");
const fs = require("fs");

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required field!"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required field!"],
      trim: true,
    },
    //durations in minutes
    duration: {
      type: Number,
      required: [true, "Duration is required field!"],
    },
    ratings: {
      type: Number,
    },
    totalRating: {
      type: Number,
    },
    releaseYear: {
      type: Number,
      required: [true, "Release year is required field!"],
    },
    releaseDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    genres: {
      type: [String],
      required: [true, "Genres is required field!"],
    },
    directors: {
      type: [String],
      required: [true, "Directors is required field!"],
    },
    coverImage: {
      type: String,
      required: [true, "Cover image is required field!"],
    },
    actors: {
      type: [String],
      required: [true, "Actors is required field!"],
    },
    price: {
      type: Number,
      required: [true, "Price is required field!"],
    },
    createdBy: String,
  },
  //This means, Each time the data is output as json, we want virtuals to be the part of output
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Virtual property that will not save in db, but will be calculated using existing field i.e duration
//This will add "durationInHours" field in each document by calculating duration in hours from "hours" field
movieSchema.virtual("durationInHours").get(function () {
  //this pointing to the document which is currently processed
  return this.duration / 60;
});

//---------------------------------------------------
//MongoDb middlewares or also Known as Pre or post hook.
//EXECUTED BEFORE THE DOCUMENT IS SAVED IN DB
// .save() or .create()
//---------------------------------------------------
//pre-hook
movieSchema.pre("save", function (next) {
  //we can extract name to token etc here, but assigned static name
  this.createdBy = "@BABAR MUGHAL";
  next();
});

//post-hook || This hook will not have access to this, it have access to currently saved document
movieSchema.post("save", function (doc, next) {
  const content = `A new movie document with name ${doc.name} has been created by ${doc.createdBy}\n`;
  fs.writeFileSync("./Log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err.message);
  });
  next();
});

//Same like above document middlewares , we also have query middlewares. i.e "find".
movieSchema.pre("find", function (next) {
  //here this keyword will point to query object, not document
  //return all those documents whose releaseDate is less than or equal to current date
  this.find({ releaseDate: { $lte: Date.now() } });
  next();
});

// 
//
//The above will only run for "find" method and if we want to fetch single movie whose releaseDate is in
//future then we'll fetch that which is issue, so for that to ensure it works properly for find, findById,
//updateById etc etc we can use regular expression just like below
//
//
// movieSchema.pre(/^find/, function (next) {
//   this.find({ releaseDate: { $lte: Date.now() } });
//   next();
// });
//
//

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
