"use strict";

const User = require("../models/user.model");
const Recruiter = require("../models/recruiter.model");
const Applicant = require("../models/applicant.model");
const jwt = require("jsonwebtoken");
const config = require("../config");
const httpStatus = require("http-status");

exports.register = async (req, res, next) => {
  console.log("in register function");
  try {
    const userData = req.body;
    const { phone,password } = userData;
    const userExist = await User.findOne({ phone: phone });
    console.log("🚀 ~ exports.register= ~ userExist:", userExist);

    if (userExist) {
      if(password == "googlelogin"){
        try {
          const user = await User.findAndGenerateToken({phone,password});
          console.log("user in register", user);
          const payload = {
            sub: user.id,
            role: user.role,
            user: {
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
            },
          };
          const token = jwt.sign(payload, config.secret);
          return res.json({ message: "OK", token: token });
        } catch (error) {
          next(error);
        }
      }else{
        res.status(409).send({ message: "Mobile number already exists." });
      }
    }

    const user = new User(userData);
    console.log("user data while creating", user, req.body);
    const savedUser = await user.save();
    console.log("saved user", savedUser);
    userData.id = savedUser.id;
    const userDetails =
      savedUser.role === "applicant"
        ? new Applicant(userData)
        : new Recruiter(userData);
    console.log("🚀 ~ exports.register= ~ userDetails:", userDetails);
    const savedUserDetails = await userDetails.save();
    const response = {
      account: savedUser.transform(),
      details: savedUserDetails.transform(),
    };

    res.status(httpStatus.CREATED);
    res.send(response);
  } catch (error) {
    return next(User.checkDuplicateEmailError(error));
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findAndGenerateToken(req.body);
    console.log("user in login", user);
    const payload = {
      sub: user.id,
      role: user.role,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
    const token = jwt.sign(payload, config.secret);
    return res.json({ message: "OK", token: token });
  } catch (error) {
    next(error);
  }
};
