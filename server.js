var express = require("express");
var app = express();
const PORT = process.env.PORT || 8000;
const cors = require("cors");
const connectDB = require("./config/db.js");
const bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.post("/virtualForm", function (req, res) {
  const dbConnect = connectDB.getDb();
  console.log(req.body);
  const user_id = Math.floor(Math.random() * 10e20);

  const userDataSchema = {
    id: user_id,
    hostName: req.body.hostName,
    hostEmail: req.body.hostEmail,
    participantsList: req.body.participantsList,
    participantsEmails: req.body.participantsEmails,
    description: req.body.description,
    fromDateTime: req.body.fromDateTime,
    toDateTime: req.body.toDateTime,
    selectedTimes: req.body.selectedTimes,
  };
  dbConnect
    .collection("userinfo")
    .insertOne(userDataSchema, function (err, result) {
      if (err) {
        console.log("Error adding user info");
        res.status(400).json({ message: "Error adding user info" });
      }
    });
});

app.get("/get/:id", async function (req, res) {
  const dbConnect = connectDB.getDb();
  const id = parseInt(req.params.id);
  try {
    await dbConnect.collection("userinfo").findOne({ id }, (err, result) => {
      let totalHrs = 0;
      if (err || result == null) {
        console.log(err);
        console.log(result);
        res.status(400).json({ message: "Error fetching status" });
      } else {
        let values = Object.values(result.selectedTimes);
        for (let i = 0; i < values.length; i++) {
          let arr = values[i].split(":");
          totalHrs += parseInt(arr[0]) * 60 * 60;
          totalHrs += parseInt(arr[1]) * 60;
        }
        let avgTime = parseFloat(totalHrs / 3600 / values.length).toFixed(2);
        let decimal = parseFloat(avgTime - Math.floor(avgTime)).toFixed(2);
        let avgTimefinal = Math.trunc(avgTime).toString();
        let decimalfinal = parseFloat((decimal / 100) * 60)
          .toFixed(2)
          .toString()
          .substring(2, 8);
        console.log(Object.values(result.selectedTimes));
        console.log(
          "The best suitable timing is at:",
          avgTime,
          decimal,
          avgTimefinal,
          decimalfinal
        );
        res.status(200).json({
          message: "Status successfully retrieved",
          result: result,
          avgTime: avgTimefinal + ":" + decimalfinal,
          message: "http://meet.google.com/new",
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: err });
  }
});

app.get("/getLink", (req, res) => {
  res.send(200, { message: "http://meet.google.com/new" });
});

connectDB.connectToServer(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
});
