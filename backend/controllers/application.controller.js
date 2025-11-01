// backend/controllers/application.controller.js
import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js"; // optional - used when populating applicants

const STATUS_DISPLAY = {
  pending: "Pending",
  accepted: "Selected",
  rejected: "Rejected",
};

// Apply for a job
export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).json({ message: "Job id is required.", success: false });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job id.", success: false });
    }

    // check if user already applied
    const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this job.", success: false });
    }

    // ensure job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    // create application
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });

    // push to job.applications if job schema has applications array
    if (Array.isArray(job.applications)) {
      job.applications.push(newApplication._id);
      await job.save();
    }

    return res.status(201).json({
      message: "Job applied successfully.",
      success: true,
      applicationId: newApplication._id,
    });
  } catch (error) {
    console.error("applyJob error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Get the list of jobs the user applied to (for profile)
export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;

    // fetch applications and populate job -> company
    const applications = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        populate: { path: "company", select: "name" },
      });

    // return empty array (easier for frontend) if none
    if (!applications || applications.length === 0) {
      return res.status(200).json({ applications: [], success: true });
    }

    // map to stable shape for frontend
    const result = applications.map((app) => ({
      id: app._id,
      jobId: app.job?._id || null,
      jobTitle: app.job?.title || "Unknown role",
      companyName: app.job?.company?.name || "Unknown company",
      status: app.status,
      statusDisplay: STATUS_DISPLAY[app.status] || app.status,
      appliedAt: app.createdAt,
      raw: app, // include raw if frontend needs it
    }));

    return res.status(200).json({ applications: result, success: true });
  } catch (error) {
    console.error("getAppliedJobs error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Admin: get applicants for a job
export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job id", success: false });
    }

    const job = await Job.findById(jobId).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: { path: "applicant", select: "fullname email phoneNumber resumeUrl" },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found.", success: false });
    }

    const applicants = (job.applications || []).map((app) => ({
      id: app._id,
      applicantId: app.applicant?._id,
      name: app.applicant?.fullname || "Unknown",
      email: app.applicant?.email || "",
      phoneNumber: app.applicant?.phoneNumber || "",
      resumeUrl: app.applicant?.resumeUrl || null,
      status: app.status,
      statusDisplay: STATUS_DISPLAY[app.status] || app.status,
      appliedAt: app.createdAt,
    }));

    return res.status(200).json({ jobId: job._id, applicants, success: true });
  } catch (error) {
    console.error("getApplicants error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Update application status (admin)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    if (!status) {
      return res.status(400).json({ message: "status is required", success: false });
    }

    const normalized = String(status).toLowerCase();
    if (!["pending", "accepted", "rejected"].includes(normalized)) {
      return res.status(400).json({ message: "Invalid status", success: false });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found.", success: false });
    }

    application.status = normalized;
    await application.save();

    return res.status(200).json({
      message: "Status updated successfully.",
      success: true,
      application: {
        id: application._id,
        job: application.job,
        applicant: application.applicant,
        status: application.status,
        statusDisplay: STATUS_DISPLAY[application.status] || application.status,
        appliedAt: application.createdAt,
      },
    });
  } catch (error) {
    console.error("updateStatus error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
