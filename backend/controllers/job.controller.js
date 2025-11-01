

// admin post krega job
// at top of file (add these imports)
import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js"; // correct for named export

// admin post krega job
export const postJob = async (req, res) => {
  try {
    // accept either JSON body or form-encoded values
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId
    } = req.body;

    const userId = req.id;

    // Basic presence checks
    if (!title || !description || !location || !jobType || !experience || !companyId) {
      return res.status(400).json({
        message: "Required fields missing (title, description, location, jobType, experience, companyId).",
        success: false
      });
    }

    // Normalize and validate companyId (allow name or id)
    let companyObjectId = companyId;
    if (!mongoose.Types.ObjectId.isValid(companyObjectId)) {
      // try find by name (frontend might be sending company name)
      const comp = await Company.findOne({ name: companyId });
      if (!comp) {
        return res.status(400).json({ message: "Company not found", success: false });
      }
      companyObjectId = comp._id;
    }

    // Requirements: accept string or array
    let reqs = [];
    if (Array.isArray(requirements)) {
      reqs = requirements;
    } else if (typeof requirements === "string" && requirements.trim() !== "") {
      reqs = requirements.split(",").map(r => r.trim()).filter(Boolean);
    }

    // Convert numeric fields
    const noOfPositions = Number(position ?? 0);
    const salaryNumber = salary === undefined || salary === null || salary === "" ? undefined : Number(salary);

    // Build create payload matching model fields
    const jobPayload = {
      title: title.trim(),
      description: description.trim(),
      requirements: reqs,
      // if your schema expects salary as string, send original; if Number, send salaryNumber
      salary: (typeof salaryNumber === "number" && !Number.isNaN(salaryNumber)) ? salaryNumber : salary,
      location: location.trim(),
      jobType,
      experienceLevel: experience,
      position: noOfPositions,
      company: companyObjectId,
      created_by: userId
    };

    const job = await Job.create(jobPayload);

    return res.status(201).json({
      message: "New job created successfully.",
      job,
      success: true
    });
  } catch (error) {
    // Print full error and return detailed validation info if present
    console.error("postJob error (full):", error);

    if (error && error.name === "ValidationError" && error.errors) {
      const details = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
        kind: error.errors[key].kind,
        value: error.errors[key].value
      }));
      return res.status(400).json({ message: "Job validation failed", details, success: false });
    }

    // generic fallback
    return res.status(500).json({ message: error.message || "Server error", success: false });
  }
};

// student k liye
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// student
// replace your existing getJobById and getAdminJobs with these

export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;

    // populate company details and applications (if Job schema references them)
    const job = await Job.findById(jobId)
      .populate({ path: "company" })        // include company info
      .populate({ path: "applications" });  // include applications array (if referenced)

    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false
      });
    }

    // compute applicant count robustly
    const totalApplicants = Array.isArray(job.applications) ? job.applications.length : 0;

    // normalize experience for frontend display
    let experienceDisplay = "";
    if (job.experienceLevel !== undefined && job.experienceLevel !== null) {
      if (typeof job.experienceLevel === "number") {
        experienceDisplay = `${job.experienceLevel} yrs`;
      } else if (typeof job.experienceLevel === "string" && job.experienceLevel.trim() !== "") {
        experienceDisplay = job.experienceLevel; // e.g. "1-3 years"
      }
    }

    return res.status(200).json({
      success: true,
      job,
      totalApplicants,
      experienceDisplay
    });
  } catch (error) {
    console.error("getJobById error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};


export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;

    // find admin's jobs, populate company, and sort by newest first
    const jobs = await Job.find({ created_by: adminId })
      .populate({ path: "company" })
      .sort({ createdAt: -1 });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false
      });
    }

    return res.status(200).json({
      jobs,
      success: true
    });
  } catch (error) {
    console.error("getAdminJobs error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
