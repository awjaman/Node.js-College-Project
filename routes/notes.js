const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Note = require("../models/Note");
const fetchuser = require("../middleware/fetchuser");
//ROUTE:1 Get all the notes using :GET  "/api/auth/getuser".   Login required
router.get("/fetchallnotes",fetchuser, async(req, res) => {
    try {
      const notes = await Note.find({ user: req.user.id });

      res.json(notes);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error ");
    }
   
});

//ROUTE:2 Add a new  notes using :POST  "/api/auth/addnote".   Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
  
    body("description", "Description at least must be a five charcter").isLength({
      min: 5,
    }),
  ],

  async (req, res) => {
      try {
        const { title, description, tag } = req.body;
        // if there are error return bad request and the error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
          title,
          description,
          tag,
          user: req.user.id,
        });
        const savedNote = await note.save();
        res.json(savedNote);
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error ");
      }
    }
      
);
//ROUTE:3 Update a existing  notes using :POST  "/api/auth/updatenote".   Login required
 router.put("/updatenote/:id", fetchuser, async (req, res) => {
   const { title, description, tag } = req.body;
   // create a newNote
   const newNote = {};
   if (title) {
     newNote.title = title;
   }
   
   if (description) {
     newNote.description = description;
   }
   if (tag) {
     newNote.tag = tag;
   }
   

   // Find a note to be updated and update it
   let note = await Note.findById(req.params.id);
   if (!note) {
     return res.status(404).send("Not Found");
   }
   if (note.user.toString() !== req.user.id) {
     return res.status(401).send("Not Found");
   }

   note= await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
   res.json({note})
 });


 //ROUTE:4 delete a existing  notes using :DELETE  "/api/auth/deletenote".   Login required
 router.delete("/deletenote/:id", fetchuser, async (req, res) => {
   

  

   // Find a note to be deleted and delete it
   let note = await Note.findById(req.params.id);
   if (!note) {
     return res.status(404).send("Not Found");
   }
   if (note.user.toString() !== req.user.id) {
     return res.status(401).send("Not Allowed");
   }

   note= await Note.findByIdAndDelete(req.params.id);
   res.json({"Success":"Note has been deleted",note:note})
 });
module.exports = router;
