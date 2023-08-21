import "dotenv/config";
import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
import md5 from "md5";

const app = express();
const port = process.env.PORT || 3000;

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
const User = new mongoose.model("User", userSchema);
const theUserDB = async () => {
    try {
        await mongoose.connect("mongodb://0.0.0.0:27017/userDB");
        console.log("Connected to database.");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home.ejs")
});

app.route("/login")
    .get((req, res) => {
        res.render("login.ejs")
    })
    .post(async (req, res) => {
        const username = req.body.username;
        const password = md5(req.body.password);
        try {
            const foundUser = await User.findOne({ email: username });
            console.log("We found the user.");
            if (foundUser) {
                if (foundUser.password === password) {
                    console.log("Password is ok.");
                    res.render("secrets.ejs");
                } else {
                    console.log("Password is wrong.");
                    res.redirect("/login");
                }
            } else {
                console.log("User notfound.");
                res.redirect("/login");
            }
        } catch (error) {
            console.error("Error message: ", error);
            res.status(500).send("Internal Server Error");
        }
    });

app.route("/register")
    .get((req, res) => {
        res.render("register.ejs")
    })
    .post(async (req, res) => {
        try {
            const foundUser = await User.findOne({ email: req.body.username })
            if (foundUser) {
                console.log("This email can't be used.");
                res.redirect("/register");
            } else {
                await new User({
                    email: req.body.username,
                    password: md5(req.body.password)
                }).save();
                console.log("User has been created and saved to the database.");
                res.render("secrets.ejs");
            }
        } catch (error) {
            console.error("Error message: ", error);
            res.status(500).send("Internal Server Error");
        }
    });

app.listen(port, async () => {
    await theUserDB();
    console.log(`Listing on port ${port}`);
});