"use strict";

const httpStatus = require("http-status");
const mongoose = require("mongoose");
const sql = require("./../services/sql");
const APIError = require("../utils/APIError");
const Job = require("../models/job.model");
const Applicant = require("../models/applicant.model");
const Recruiter = require("../models/recruiter.model");
// const // Redisclient = require('../services/redis')

exports.get = async (req, res, next) => {

  try {
    console.log("in get job function");
    // Assuming `req.user._id` contains the ID of the recruiter
    const recruiterId = req.user._id;

    const jobsWithApplicationCount = await Job.aggregate([
      // Match jobs where the recruiter is the current user
      { $match: { recruiter: mongoose.Types.ObjectId(recruiterId) } },
      // Lookup (join) with the Application collection
      {
        $lookup: {
          from: "applications", // Ensure this matches your collection name
          localField: "_id", // Field from the jobs collection
          foreignField: "jobId", // Field from the applications collection matching jobs._id
          as: "applications" // The array where the matched documents will be placed
        }
      },
      // Add applicationCount field while keeping all original job details
      {
        $addFields: {
          applicationCount: { $size: "$applications" }
        }
      },
      // Optionally, if you don't want to send the applications array
      {
        $project: {
          applications: 0 // Exclude the applications array from the output
        }
      }
    ]);

    const response = {
      payLoad: jobsWithApplicationCount
    };

    console.log("🚀 ~ file: jobs.controller.js:18 ~ exports.get= ~ response.payLoad:", response.payLoad);
    res.status(httpStatus.OK).send(jobsWithApplicationCount);
  } catch (error) {
    console.error("Error in getting jobs: ", error);
    next(error);
  }
//   try {
//     // console.log('\n\n\n', req.user.role, '\n\n\n')
//     console.log("in get job funtion");
//     const response = { payLoad: {} };
//     const jobs = await Job.find().exec();
//     response.payLoad = jobs;
//     console.log(
//       "🚀 ~ file: jobs.controller.js:18 ~ exports.get= ~ response.payLoad:",
//       response.payLoad
//     );
//     res.status(httpStatus.OK);
//     res.send(response);
//   } catch (error) {
//     next(error);
//   }
};

exports.getAllJob = async (req, res, next) => {
    try {
    // console.log('\n\n\n', req.user.role, '\n\n\n')
    console.log("in get job funtion");
    const response = { payLoad: {} };
    const jobs = await Job.find().exec();
    response.payLoad = jobs;
    console.log(
      "🚀 ~ file: jobs.controller.js:18 ~ exports.get= ~ response.payLoad:",
      response.payLoad
    );
    res.status(httpStatus.OK);
    res.send(response);
  } catch (error) {
    next(error);
  }
}

// exports.post = async (req, res, next) => {
//   console.log("in job post", req.body);
//   try {
//     // console.log('\n\n\n', req.user.role, '\n\n\n')
//     if (req.user.role !== "recruiter")
//       throw new APIError(
//         `Unauthorized only Recruiter can create a job`,
//         httpStatus.UNAUTHORIZED
//       );
//     const response = { payLoad: {} };
//     req.body.recruiter = req.user._id;
//     const job = new Job(req.body);
//     console.log("Job", job);

//     const createdJob = await job.save();
//     console.log("createdJob45", createdJob);
//     if (!createdJob) {
//       throw new APIError(`Job not created`, httpStatus.INTERNAL_SERVER_ERROR);
//     }
//     console.log("req.user._id,", req.user._id);
//     const updatedRecruiter = await Recruiter.findByIdAndUpdate(
//       req.user._id,
//       { $push: { jobs: createdJob._id } },
//       { new: true }
//     );

//     console.log("updatedRecruiter", updatedRecruiter);

//     if (!updatedRecruiter) {
//       throw new APIError(
//         `Failed to update recruiter with the new job`,
//         httpStatus.INTERNAL_SERVER_ERROR
//       );
//     }
//     response.payLoad = createdJob;
//     res.status(httpStatus.OK);
//     res.send(response);
//   } catch (error) {
//     next(error);
//   }
//   console.log("🚀 ~ exports.post= ~ req.user._id,:", req.user._id);
//   console.log("🚀 ~ exports.post= ~ req.user._id,:", req.user._id);
// };

exports.post = async (req, res, next) => {
  console.log("in job post", req.body);
  try {
    // Check if the user is authorized to create a job
    if (req.user.role !== "recruiter") {
      throw new APIError(
        `Unauthorized only Recruiter can create a job`,
        httpStatus.UNAUTHORIZED
      );
    }

    // Set the recruiter ID in the job details
    req.body.recruiter = req.user._id;
    const job = new Job(req.body);
    console.log("Job", job);

    // Save the new job
    const createdJob = await job.save();
    console.log("createdJob", createdJob);

    // Validate if the job was created successfully
    if (!createdJob) {
      throw new APIError(`Job not created`, httpStatus.INTERNAL_SERVER_ERROR);
    }

    // Update the recruiter with the new job
    // const updatedRecruiter = await Recruiter.findByIdAndUpdate(
    //   req.user._id,
    //   { $push: { jobs: createdJob._id } },
    //   { new: true }
    // );
    let updatedRecruiter;
    console.log("🚀 ~ exports.post= ~ req.user._id:", req.user._id)
    const recruiter = await Recruiter.findOne({ id: req.user._id });
    if (recruiter) {
      recruiter.jobs.push(createdJob._id);
      updatedRecruiter = await recruiter.save();
      console.log("🚀 ~ exports.post= ~ updatedRecruiter:", updatedRecruiter);
      // Check and proceed with updatedRecruiter
    } else {
      throw new APIError(
        `Failed to update job. No recruiter found`,
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Validate if the recruiter was updated successfully
    if (!updatedRecruiter) {
      throw new APIError(
        `Failed to update recruiter with the new job`,
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Prepare and send the response
    const response = {
      payLoad: createdJob,
      message: "Job created and recruiter updated successfully",
    };

    res.status(httpStatus.OK).send(response);
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in creating job: ", error);

    // Pass the error to the error handling middleware
    next(error);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.jobId))
      throw new APIError(`Invalid jobId`, httpStatus.BAD_REQUEST);
    const response = { payLoad: {} };
    const job = await Job.findById(req.params.jobId).exec();
    response.payLoad = job;
    res.status(httpStatus.OK);
    res.send(response);
  } catch (error) {
    next(error);
  }
};

exports.jobsByRecruiter = async (req, res, next) => {
  try {
    console.log(req.user._id);
    const response = { payLoad: [] };
    const ObjectID = mongoose.Types.ObjectId;
    var query = {
      recruiter: new ObjectID(req.user._id),
    };
    const jobs = await Job.find(query);
    for (let index = 0; index < jobs.length; index++) {
      var job_id = jobs[index]["_id"];
      var application_count = await sql.query(
        `SELECT COUNT(*) as count FROM job_application WHERE job_id = '${job_id}'`
      );
      var save_count = await sql.query(
        `SELECT COUNT(*) as count FROM saved_job WHERE job_id = '${job_id}'`
      );
      var convertedJobJSON = JSON.parse(JSON.stringify(jobs[index]));
      convertedJobJSON.application_count = application_count[0].count;
      convertedJobJSON.save_count = save_count[0].count;
      response.payLoad.push(convertedJobJSON);
    }
    res.status(httpStatus.OK);
    res.send(response);
  } catch (error) {
    next(error);
  }
};

exports.putOne = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.jobId))
      throw new APIError(`Invalid jobId`, httpStatus.BAD_REQUEST);
    const response = { payLoad: {}, message: "" };
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId).exec();
    if (!job)
      throw new APIError(
        `No job associated with id: ${jobId}`,
        httpStatus.NOT_FOUND
      );
    for (const key in req.body) {
      if (
        job.schema.obj.hasOwnProperty(key) &&
        key !== "id" &&
        key !== "_id" &&
        key !== "recruiter"
      ) {
        job[key] = req.body[key];
      }
    }
    const updatedJob = await job.save();
    if (updatedJob) {
      response.message = "SUCCESS";
      response.payLoad = updatedJob;
    } else {
      throw new APIError(
        `Job with id: ${jobId} not updated`,
        httpStatus.NOT_FOUND
      );
    }
    res.status(httpStatus.OK);
    res.send(response);
  } catch (error) {
    next(error);
  }
};

exports.deleteOne = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.jobId))
      throw new APIError(`Invalid jobId`, httpStatus.BAD_REQUEST);
    const response = { payLoad: {}, message: "" };
    const deleteJob = await Job.findByIdAndDelete(req.params.jobId).exec();
    if (deleteJob) {
      response.message = "SUCCESS";
      res.status(httpStatus.OK);
      res.send(response);
    } else {
      throw new APIError(
        `Job with id: ${req.params.jobId} not deleted`,
        httpStatus.NOT_FOUND
      );
    }
  } catch (error) {
    next(error);
  }
};

exports.recommendation = async (req, res, next) => {
  try {
    const user = await Applicant.findOne({ id: req.user._id }).exec();
    const skills = user.skills ? user.skills : [];
    const response = { payLoad: [] };
    const jobs = await Job.find().exec();
    let passesCriteria = false;
    for (let index = 0, addCount = 0; index < jobs.length; index++) {
      const element = jobs[index];
      if (skills.length > 0 && element.skills) {
        passesCriteria = false;
        skills.forEach((skill) => {
          if (element.skills.includes(skill)) passesCriteria = true;
        });
      }
      if (passesCriteria && addCount < 12) {
        response.payLoad.push(element);
        jobs.splice(index, 1);
        addCount++;
      }
    }
    if (response.payLoad.length < 12) {
      let lat = null;
      let long = null;
      if (user.address) {
        if (user.address.coordinates) {
          lat = user.address.coordinates.latitude
            ? user.address.coordinates.latitude
            : null;
          long = user.address.coordinates.longitude
            ? user.address.coordinates.longitude
            : null;
        }
        for (let index = 0; index < jobs.length; index++) {
          const element = jobs[index];
          passesCriteria = false;
          if (lat && long && passesCriteria) {
            passesCriteria =
              distance(
                lat,
                long,
                element.address.coordinates.latitude,
                element.address.coordinates.longitude
              ) < 50;
          }
          if (passesCriteria) {
            response.payLoad.push(element);
            jobs.splice(index, 1);
          }
        }
      }
    }
    if (response.payLoad.length < 12) {
      for (let index = 0; index < jobs.length && index < 10; index++) {
        const element = jobs[index];
        response.payLoad.push(element);
        jobs.splice(index, 1);
      }
    }

    // // Redisclient.set(req.user._id, JSON.stringify(response.payLoad))
    res.status(httpStatus.OK);
    res.send(response);
  } catch (error) {
    next(error);
  }
};

const distance = (lat1, lon1, lat2, lon2) => {
  var radlat1 = (Math.PI * lat1) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  var theta = lon1 - lon2;
  var radtheta = (Math.PI * theta) / 180;
  var dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  return dist.toPrecision(2);
};
