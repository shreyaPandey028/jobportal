import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import userRoute from './routes/user.routes.js';
console.log(userRoute);
import companyRoute from './routes/company.route.js';
import jobRoute from './routes/job.route.js';
import applicationRoute from './routes/application.route.js';
dotenv.config();
const app = express();
app.get("/", (req, res) => {
    return res.status(200).json({ message: "welcome to API",timestamp:new Date().toISOString(), success:true, });  });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(cors({
  origin: "http://localhost:5173",   // your frontend's URL
  credentials: true
}));

const PORT = process.env.PORT || 5001;
app.use("/api/v1/user", userRoute);
console.log("✅ userRoute registered");
 app.use("/api/v1/company",companyRoute  );
 console.log("✅ companyRoute registered");
app.use("/api/v1/job",jobRoute  );
app.use("/api/v1/application", applicationRoute);

app.listen(PORT ,()=> {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
})
