const User = require("./Modules/user");

const eventEmitter = new User();

eventEmitter.on("userCreated", (id, userName) => {
  console.log(
    `A new user with id ${id} and name ${userName} has been created!`
  );
});

eventEmitter.on("userCreated", (id, userName) => {
  console.log(
    `A new user with id ${id} and name ${userName} has been saved into Db successfully!`
  );
});

eventEmitter.emit("userCreated", 123, "Babar");
