"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const address = require("./address.model");
// const recruiter = require('./recruiter.model')

const jobSchema = new Schema(
  {
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      // required: true
    },
    location: {
      type: String,
      // required: true
    },
    // function: {
    //   type: String,
    //   required: true
    // },
    company_logo: {
      type: String,
      // required: true
    },
    tags: {
      type: [String],
    },
    salary: {
      type: Number,
    },
    easy_apply: {
      type: Boolean,
      default: false,
    },
    company_description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      "title",
      "company",
      "description",
      "category",
      "type",
      "location",
      "company_logo",
      "tag",
      "city",
    ];
    fields.forEach((field) => {
      transformed[field] = this[field];
    });
    return transformed;
  },
  titleTransform() {
    const transformed = {};
    const fields = ["title"];
    fields.forEach((field) => {
      transformed[field] = this[field];
    });
    return transformed;
  },
});

// module.exports = {
//   'Job': mongoose.model('Job', jobSchema),
//   'jobSchema': jobSchema
// }
module.exports = mongoose.model("Job", jobSchema);
