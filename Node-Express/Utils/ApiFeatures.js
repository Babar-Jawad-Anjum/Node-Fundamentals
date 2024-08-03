//======================================================================//
//                                                                      //
//        Making a reusable class form which we can use filter,         //
//        sort, pagination logic in any router controller               //
//                                                                      //
//======================================================================//

class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    let queryString = JSON.stringify(this.queryStr);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(queryString);
    //returning the context of ApiFeatures class, if we want to chain multiple methods of this class with filter(),
    //so that's why returning this, i.e .filter().sort() etc
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      // - means exclude mentioned fields from records, i.e exclude createdAt from collections if exist
      this.query = this.query.select("-createdAt");
    }

    return this;
  }

  paginate() {
    const page = +this.queryStr.page || 1;
    const limit = +this.queryStr.limit || 10;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = ApiFeatures;
