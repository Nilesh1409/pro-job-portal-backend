"use strict";

const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/authorization");
const jobsController = require("../../controllers/jobs.controller");
const applicationController = require("../../controllers/application.controller");
const validator = require("express-validation");
const {
  create,
  update,
  apply,
  easyApply,
  AppliedForJOb,
} = require("../../validations/jobs.validation");
const { jobId } = require("../../validations/common.validation");
const recommendationCache = require("../../middlewares/recommendationCache");

// router.get('/applied/count', auth(['applicant']), applicationController.fetchAppliedCount)
// router.get('/applied', auth(['applicant']), applicationController.fetchApplied)
// router.get('/saved/count', auth(['applicant']), applicationController.fetchSavedCount)
// router.get('/saved', auth(['applicant']), applicationController.fetchSaved)
console.log("in job file");
router.get(
  "/",
  jobsController.getAllJob)
router.get("/posted", auth(), jobsController.get);
router.post("/", auth(["recruiter"]), validator(create), jobsController.post);
router.get("/applications", auth(["recruiter"]),  applicationController.getApplicationDetails);
// router.get('/recommendation', auth(['applicant']), recommendationCache, jobsController.recommendation)
// router.get('/findByRecruiter', auth(['recruiter']), jobsController.jobsByRecruiter)
router.get("/:jobId", auth(), validator(jobId), jobsController.getOne);
// router.get('/:jobId/details', auth(['recruiter']), validator(jobId), applicationController.getApplicationDetails)
// router.put('/:jobId', auth(['recruiter']), validator(jobId), validator(update), jobsController.putOne)
// router.delete('/:jobId', auth(['recruiter']), validator(jobId), jobsController.deleteOne)
// router.post('/:jobId/save', auth(['applicant']), validator(jobId), applicationController.save)
// router.post('/:jobId/unsave', auth(['applicant']), validator(jobId), applicationController.unsave)
router.post(
  "/apply/:jobId",
    auth(["applicant"]),
  //   validator(jobId),
  // validator(apply),
  applicationController.apply
);
router.post(
  "/applied/:jobId",
  validator(AppliedForJOb),
  applicationController.checkUserApplication
);
console.log("in jobs router");
router.get(
  "/appliedJobs/:applicantId",
  // validator(AppliedForJOb),
  applicationController.getAppliedJobs
);
// router.post('/:jobId/easyApply', auth(['applicant']), validator(jobId), validator(easyApply), applicationController.easyApply)

module.exports = router;
