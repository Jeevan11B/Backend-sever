const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
app.use(express.json());
const monUrl =
  "mongodb+srv://jeevanbhargav:admin@cluster0.jhbrfri.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const JWT_SECRET = "jeevanbhargav123456";

mongoose
  .connect(monUrl)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((e) => {
    console.log(e);
  });

require("./UserDtails");
const User = mongoose.model("UserInfo");
app.get("/", (req, res) => {
  res.send({ status: "started" });
});
app.post("/register", async (req, res) => {
  const { name, email, mobile, password , userType} = req.body;

  const oldUser = await User.findOne({ email: email });
  if (oldUser) {
    return res.send({ data: "User already exists !!" }); 
  }

  try {
    const encryptedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name,
      email: email,
      mobile,
      password: encryptedPassword,
      userType
    });

    return res.send({ status: "ok", data: "User Created" }); 
  } catch (error) {
    return res.send({ status: "error", data: error }); 
  }
});

app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await User.findOne({ email: email });

    if (!oldUser) {
      return res.send({ data: "User doesn't exist!" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect) {
      return res.status(400).send({ data: "Invalid password" });
    }

    const token = jwt.sign({ email: oldUser.email }, JWT_SECRET);

    return res.status(200).send({ status: "ok", data: token, userType:oldUser.userType });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ status: "error", data: err.message });
  }
});

app.post("/userdata", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    const usermail = user.email;
    User.findOne({ email: usermail }).then((data) => {
      return res.send({ status: "ok", data: data });
    });
  } catch (error) {
    return res.status(500).send({ status: "error", data: error.message });
  }
});

app.post("/update-user", async (req, res) => {
  const { name, email, mobile, image, gender, profession } = req.body;
  try {
    await User.updateOne(
      {
        email: email,
      },
      {
        $set: {
          name,
          mobile,
          image,
          gender,
          profession,
        },
      }
    );
    res.send({ status: "ok", data: "update" });
  } catch (error) {
    return res.send({ error: error });
  }
});

app.get("/get-all-user",async (req,res)=>{
  try {
    const data = await User.find({});
    res.send({status:"ok",data:data});
  } catch (error) {
    return res.send({error:error});
  }
})
 
app.post("/delete-user",async (req,res) =>{
  const {id} = req.body;
  try {
    await User.deleteOne({_id:id});
    res.send({status:"Ok",data:"User is Deleted"});
  } catch (error) {
    return res.send({error:error});
  }
})

app.listen(5001, () => {
  console.log("Node js server started...");
});
