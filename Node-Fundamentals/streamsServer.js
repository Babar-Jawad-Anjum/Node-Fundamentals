const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  //     -----------------------------------------------------------------------   //
  //           Here below code reading huge file content which takes some          //
  //           time and might crash, we can't do this in prod environment           //
  //     ----------------------------------------------------------------------    //

  // fs.readFile("./Files/large-file.txt", (err, data) => {
  //   if (err) {
  //     res.end("Something went wrong on server");
  //   }
  //   if (data) {
  //     res.end(data);
  //   }
  // });

  //Resolving above problem by using streams
  let rs = fs.createReadStream("./Files/large-file.txt");

  //listening to event "data" from where we grt chunk of data read from file
  rs.on("data", (chunk) => {
    res.write(chunk);
  });

  //All file data read has been done, no chunk available to read
  rs.on("end", () => {
    res.end();
  });
 
  rs.on("error", (error) => {
    res.end(error.message);
  }); 

  //     ---------------------------------------------------------------------------------------------------------     //
  //      In above code we have one more issue, and that is let's say our readable stream is reading data at           //
  //      4 mbps and writable stream writing data at 2 mbps so readable stream is much faster writable stream          //
  //      is bit slower this will overwhelm the writable  stream which cannot handle all these incoming data           //
  //      so fast. and this problem is called back pressure so back pressure happens when the response cannot          //
  //      send data nearly as fast as it is receiving it from the file, to solve this problem we can use pipe()        //
  //      method, remove above code, use just this one below:                                                          //
  //                                                                                                                   //
  //           let rs = fs.createReadStream("./Files/large-file.txt");                                                 //
  //           rs.pipe(res);                                                                                           //
  //                                                                                                                   //
  //     -----------------------------------------------------------------------------------------------------------   //
});

server.listen("8000", () => {
  console.log("Server listening at port 8000");
});
