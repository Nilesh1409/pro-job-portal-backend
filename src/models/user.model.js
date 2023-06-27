"use strict";
const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const httpStatus = require("http-status");
const APIError = require("../utils/APIError");
const Schema = mongoose.Schema;

const roles = ["recruiter", "applicant"];

const userSchema = new Schema(
  {
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 128,
    },
    role: {
      type: String,
      default: "applicant",
      enum: roles,
    },
    name: {
      first: {
        type: String,
        required: true,
      },
      last: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }

    this.password = bcrypt.hashSync(this.password);

    return next();
  } catch (error) {
    console.log("error in use schema", error);
    return next(error);
  }
});

userSchema.method({
  transform() {
    const transformed = {};
    const fields = ["id", "phone", "createdAt", "role"];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  passwordMatches(password) {
    return bcrypt.compareSync(password, this.password);
  },
});

userSchema.statics = {
  roles,

  checkDuplicateEmailError(err) {
    if (err.code === 409) {
      var error = new Error("Phone number already taken");
      error.errors = [
        {
          field: "phone",
          location: "body",
          messages: ["Phone number already taken"],
          errors: err,
        },
      ];
      error.status = httpStatus.CONFLICT;
      return error;
    }

    return err;
  },

  async findAndGenerateToken(payload) {
    const { phone, password } = payload;
    if (!phone) throw new APIError("Phone must be provided for login");

    const user = await this.findOne({ phone }).exec();
    if (!user)
      throw new APIError(
        `No user associated with ${phone}`,
        httpStatus.NOT_FOUND
      );

    const passwordOK = await user.passwordMatches(password);

    if (!passwordOK)
      throw new APIError(`Password mismatch`, httpStatus.UNAUTHORIZED);

    return user;
  },
};

module.exports = mongoose.model("User", userSchema);
