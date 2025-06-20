const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const https = require("https");
require("dotenv").config();

const { default: mongoose } = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/User");
const Car = require("./model/car");
const Cardetail = require("./model/cardetail");
const Admin = require("./model/admin");
const Query = require("./model/query");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const NewCarDetail = mongoose.model("NewCarDetail", Cardetail.Cardetail);
const Src = mongoose.model("Src", Cardetail.Src);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect("/login");
}

app.get("/secret", isLoggedIn, function (req, res) {
  res.render("secret");
});

app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username, name: req.body.name, role: "customer" },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        return res.redirect("/register");
      }
      req.login(user, (err) => {
        if (err) {
          console.log(err);
          return res.redirect("/login");
        }
        return res.redirect("/");
      });
    }
  );
});

app.get("/login", function (req, res) {
  if (req.isAuthenticated()) res.render("index");
  else res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/", function (req, res) {
  res.render("index");
});
app.get("/index", function (req, res) {
  res.render("index");
});
app.get("/services", function (req, res) {
  res.render("services");
});
app.get("/about", function (req, res) {
  res.render("about");
});
app.get("/contact", function (req, res) {
  res.render("contact");
});
app.get("/signup", function (req, res) {
  res.render("register");
});
app.post("/contact", async (req, res) => {
  try {
    const { userName, userEmail, userMsg } = req.body;
    const newQuery = new Query({
      name: userName,
      email: userEmail,
      message: userMsg,
      date: new Date(),
    });
    await newQuery.save();
    res.send(
      '<script>alert("Thank you for contacting us!"); window.location.href = "/contact"; </script>'
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving your message.");
  }
});
app.get("/admin", (req, res) => {
  res.render("admin");
});
app.get("/booking", (req, res) => {
  Car.find({}).then((result) => {
    if (result != null) {
      res.render("booking", { Allcar: result });
    } else {
      res.redirect("/booking");
    }
  });
});

app.post("/booking", (req, res) => {
  const CAR = req.body.model.split(",");
  if (req.isAuthenticated()) {
    const UserName = req.user.username;
    Car.findOne({ company: CAR[1] }).then((result) => {
      if (result != null) {
        for (let i = 0; i < result.carType.length; i++) {
          if (result.carType[i].carName == CAR[0]) {
            if (result.carType[i].avaibality > 0) {
              result.carType[i].avaibality -= 1;
              result.save();
              User.findOne({ username: UserName }).then((result2) => {
                if (result2 != null) {
                  result2.cart.push(result.carType[i]);
                  result2.save();
                }
              });
              res.send(
                '<script>alert("Booking Successful"); window.location.href = "/"; </script>'
              );
            } else {
              res.send(
                '<script>alert("Currently Not Available"); window.location.href = "/booking"; </script>'
              );
            }
          }
        }
      } else {
        res.redirect("/");
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/admin/:listname", (req, res) => {
  const listName = req.params.listname;
  res.render(listName);
});

// Car brand and model routes
app.get("/toyota", (req, res) => res.render("toyota"));
app.get("/audi", (req, res) => res.render("audi"));
app.get("/bmw", (req, res) => res.render("bmw"));
app.get("/chevrolet", (req, res) => res.render("chevrolet"));
app.get("/toyotaprado", (req, res) => res.render("toyotaprado"));
app.get("/toyotainnova", (req, res) => res.render("toyotainnova"));
app.get("/toyotaetios", (req, res) => res.render("toyotaetios"));
app.get("/toyotacamry", (req, res) => res.render("toyotacamry"));
app.get("/toyotafortuner", (req, res) => res.render("toyotafortuner"));
app.get("/audia8", (req, res) => res.render("audia8"));
app.get("/auditt", (req, res) => res.render("auditt"));
app.get("/audiQ7", (req, res) => res.render("audiQ7"));
app.get("/audiRS7", (req, res) => res.render("audiRS7"));
app.get("/audiR8", (req, res) => res.render("audiR8"));
app.get("/bmwi8", (req, res) => res.render("bmwi8"));
app.get("/bmwm3", (req, res) => res.render("bmwm3"));
app.get("/bmwm4", (req, res) => res.render("bmwm4"));
app.get("/bmwx3", (req, res) => res.render("bmwx3"));
app.get("/bmwx6", (req, res) => res.render("bmwx6"));
app.get("/chevroletEnjoy", (req, res) => res.render("chevroletEnjoy"));
app.get("/chevroletSail", (req, res) => res.render("chevroletSail"));
app.get("/chevroletTrailBlazer", (req, res) =>res.render("chevroletTrailBlazer"));
app.get("/chevroletCruze", (req, res) => res.render("chevroletCruze"));
app.get("/chevroletBeat", (req, res) => res.render("chevroletBeat"));
app.get("/mitsubishi", (req, res) => res.render("mitsubishi"));
app.get("/mCedia", (req, res) => res.render("mCedia"));
app.get("/mLancer", (req, res) => res.render("mLancer"));
app.get("/montero", (req, res) => res.render("montero"));
app.get("/mOutlander", (req, res) => res.render("mOutlander"));
app.get("/mPajero", (req, res) => res.render("mPajero"));
app.get("/AstonMartin", (req, res) => res.render("AstonMartin"));
app.get("/amDB11", (req, res) => res.render("amDB11"));
app.get("/amRapide", (req, res) => res.render("amRapide"));
app.get("/amVanquish", (req, res) => res.render("amVanquish"));
app.get("/amVantage", (req, res) => res.render("amVantage"));
app.get("/amVulcan", (req, res) => res.render("amVulcan"));

// Dynamic company and car detail routes
app.get("/:companyName", (req, res) => {
  const companyName = req.params.companyName;
  if (companyName != "favicon.ico")
    Car.findOne({ company: companyName }).then((rslt) => {
      if (rslt != null) {
        let N = rslt.carType.length;
        res.render("company", {
          result: rslt.carType,
          n: N,
          companyName: companyName,
        });
      } else {
        res.redirect("/");
      }
    });
});

app.get("/:companyName/:route", (req, res) => {
  const carname = req.params.route;
  const companyName = req.params.companyName;
  Car.findOne({ company: companyName }).then(function (result) {
    if (result != null) {
      const carType = result.carType;
      let flag = true;
      for (let i = 0; i < carType.length; ++i) {
        if (carType[i].route == carname) {
          flag = false;
          res.render("cardetail", { data: carType[i] });
          break;
        }
      }
      if (flag) res.redirect("/companyName");
    } else {
      res.send(
        '<script>alert("Not available"); window.location.href = "/"; </script>'
      );
    }
  });
});

app.listen(3000, function () {
  console.log("Server started at 3000");
});
