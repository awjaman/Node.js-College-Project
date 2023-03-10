const express =require('express');
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET ="Amanisagoodb$oy"
//ROUTE:1 create a user using :POST  "/api/auth/createuser"  .No login required


router.post(
  '/createuser',
  [body('name','Enter a valid name ').isLength({ min: 3 }),
  body("email",'Enter a  valid email').isEmail(), 
  body("password",'Enter a passward at least 8 character').isLength({ min: 8 })],
  async (req, res) => {

      // if there are error return bad request and the error 
       const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    
  }
  //check whether the user with this  email exist already 

  try{
     let user =await User.findOne({email:req.body.email});
     if(user)
     {
         return res.status(400).json({error:"Sorry a user with this email already exist"})
     }
     const salt=await bcrypt.genSalt(10);


     const secPass = await bcrypt.hash(req.body.password, salt);
   // create a user
   user =await User.create({
    name: req.body.name,
    password: secPass,
    email: req.body.email,
  })
  
//   .then((user) => res.json(user))
//   .catch(err=>{console.log(err)
// res.json({error:'please enter unique value for email',message:err.meassge})})
const data={
    user:{
        id:user.id
    }
}


 const authtoken= jwt.sign(data, JWT_SECRET);



res.json({authtoken});
  }
  catch(error)
  {
      console.error(error.message);
      res.status(500).send("Some error occured");
  }

}
);

// ROUTE:2 authenticate  a user using :POST  "/api/auth/login"  .No login required

router.post(
  '/login',
  [body("email",'Enter a  valid email').isEmail(), 
  body("password",'Password cannot be a blank ').exists()],
  async (req, res) => {
       const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
        

      // use destructuring 
    const{email,password}=req.body;
    try {
      let user = await User.findOne({ email }); // take object 
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credential" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credential" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);

      res.json({ authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server error");
    }
  })

 // ROUTE:3 Get loggedin user details  using :POST  "/api/auth/getuser".   Login required
       router.post('/getuser',fetchuser, async (req, res) => {
     try {
         userId=req.user.id;
         const user =await User.findById(userId).select("-password");
          res.send(user);

     } catch (error) {
       console.error(error.message);
       res.status(500).send("Internal Server error");
     }
    })
module.exports=router;