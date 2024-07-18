const fs = require("fs");
const http = require("http");
const url = require("url");

//A module is nothing but just a script file from where we can export some values

//Custom Module import
const replaceHtml = require("./Modules/replaceHtml");

//---------------------------------------------------------------//
//                         FILE SYSTEM                           //
//---------------------------------------------------------------//

//Read & Write file synchronously

// let fileContent = fs.readFileSync("./Files/blog.txt", "utf-8");
// console.log(fileContent);
// let content = `Data read from blog: ${fileContent} - Read At: ${new Date()}`;
// fs.writeFileSync("./Files/output.txt", content);

//Read & Write file Asynchronously

// fs.readFile("./Files/blog.txt", "utf-8", (error, data) => {
//   if (data) {
//     console.log(data);
//   }
//   if (error) {
//     console.log(`Error:: ${error}`);
//   }
// });

//------------------------------------------------------------------//
//                      SIMPLE HTTP WEB SERVER                      //
//------------------------------------------------------------------//

//Read content from HTML File
const baseHTML = fs.readFileSync("./Template/index.html", "utf-8");
//Read content from json File
const products = fs.readFileSync("./Data/products.json", "utf-8");
//Read content from Products List File
const productsListHtml = fs.readFileSync(
  "./Template/product-list.html",
  "utf-8"
);
//Read content from product details File
const productDetailsHtml = fs.readFileSync(
  "./Template/product-details.html",
  "utf-8"
);

//STEP-1: Create a Server
const server = http.createServer((req, res) => {
  let { query, pathname } = url.parse(req.url, true);

  switch (pathname) {
    case "/":
      //Setting Headers
      res.writeHead(200, {
        "Content-Type": "text/html",
      });
      //Sending Response back to client
      res.end(baseHTML.replace("{{%CONTENT%}}", "You're in HomePage"));
      break;
    case "/home":
      //Setting Headers
      res.writeHead(200, {
        "Content-Type": "text/html",
      });
      //Sending Response back to client
      res.end(baseHTML.replace("{{%CONTENT%}}", "You're in HomePage"));
      break;
    case "/about":
      //Setting Headers
      res.writeHead(200, {
        "Content-Type": "text/html",
      });
      //Sending Response back to client
      res.end(baseHTML.replace("{{%CONTENT%}}", "You're in AboutPage"));
      break;
    case "/contact":
      //Setting Headers
      res.writeHead(200, {
        "Content-Type": "text/html",
      });
      //Sending Response back to client
      res.end(baseHTML.replace("{{%CONTENT%}}", "You're in ContactPage"));
      break;
    case "/products":
      //if query params exist, then return that specific single product html
      if (query.id) {
        //Parsing JSON into javascript objects
        const parsedProductsData = JSON.parse(products);

        //getSingle product from array of products objects
        let singleProduct = parsedProductsData[query.id];

        //Make HTML of single product
        let productHtml = replaceHtml(productDetailsHtml, singleProduct);

        //Setting Headers
        res.writeHead(200, { "Content-Type": "text/html" });
        //Sending Response back to client
        res.end(baseHTML.replace("{{%CONTENT%}}", productHtml));
      } else {
        //Parsing JSON into javascript objects
        const parsedProductsData = JSON.parse(products);

        //Loop through products array and make HTML of each product
        let productsDataHtml = parsedProductsData.map((product) => {
          return replaceHtml(productsListHtml, product);
        });

        //Setting Headers
        res.writeHead(200, { "Content-Type": "text/html" });
        //Sending Response back to client
        res.end(baseHTML.replace("{{%CONTENT%}}", productsDataHtml.join(",")));
      }

      break;

    default:
      //Setting Headers
      // res.writeHead(404);
      break;
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Server started at port 8000");
});
