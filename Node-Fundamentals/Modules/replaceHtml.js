//Generic helper function to embed json data into HTMLTemplate
module.exports = function (template, product) {
  let output = template.replace("{{%IMAGE%}}", product.image);
  output = output.replace("{{%NAME%}}", product.name);
  output = output.replace("{{%DESC%}}", product.description);
  output = output.replace("{{%CATEGORY%}}", product.category);
  output = output.replace("{{%STOCK%}}", product.stock);
  output = output.replace("{{%RATING%}}", product.rating);
  output = output.replace("{{%PRICE%}}", product.price);
  output = output.replace("{{%ID%}}", product.id);

  return output;
};
