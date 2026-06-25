import { Router, type IRouter } from "express";
import healthRouter from "./health";
import policiesRouter from "./policies";
import gradesRouter from "./grades";
import activitiesRouter from "./activities";
import recordsRouter from "./records";
import studentProfileRouter from "./student_profile";
import resultsRouter from "./results";
import consultingRouter from "./consulting";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/policies", policiesRouter);
router.use("/grades", gradesRouter);
router.use("/activities", activitiesRouter);
router.use("/records", recordsRouter);
router.use("/student-profile", studentProfileRouter);
router.use("/results", resultsRouter);
router.use("/consulting", consultingRouter);

export default router;
