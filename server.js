// import dependencies
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

// create the Express App
const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(require("./routes/api.js"));

// MongoDB connection
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/budgetdb", 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }
);

// start the server
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});