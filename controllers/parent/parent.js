import Parent from "../../models/Parent.js";
import Report from "../../models/Report.js";
import Review from "../../models/Review.js";
import Course from "../../models/Course.js";
export const getParentProfile = async (req, res) => {
  try {
    const parent = await Parent.findById(req.user.id).select("-password");

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    res.json({
      success: true,
      result: parent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateParentProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const parent = await Parent.findById(req.user.id);

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    parent.fullName = name || parent.name;
    parent.mobile = phone || parent.phone;

    await parent.save();

    res.json({
      success: true,
      result: parent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};

export const deleteParentProfile = async (req, res) => {
  try {
    await Parent.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};


export const addReview = async (req,res)=>{
try{

  console.log("rev11")

const { courseId, rating, review } = req.body;

const course = await Course.findById(courseId);

if(!course){
return res.status(404).json({message:"Course not found"});
}

const existing = await Review.findOne({
courseId,
parentId:req.user.id
});

if(existing){
return res.status(400).json({message:"You already reviewed this tutor"});
}

const newReview = await Review.create({
courseId,
tutorId:course.tutorId,
parentId:req.user.id,
rating,
review
});

res.json(newReview);

}catch(err){
res.status(500).json({message:"Failed to add review"});
}
};



export const reportTutor = async (req,res)=>{
try{

    console.log("report11")

const { courseId, reason } = req.body;

const course = await Course.findById(courseId);

if(!course){
return res.status(404).json({message:"Course not found"});
}

const report = await Report.create({
courseId,
tutorId:course.tutorId,
parentId:req.user.id,
reason
});

res.json(report);

}catch(err){
res.status(500).json({message:"Failed to report tutor"});
}
};