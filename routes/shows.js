// linking and requiring everything 
const express = require("express");
const showsRouter = express.Router();
const Show = require("../models/Show");
const User = require("../models/User"); // rewuiring User so it can be used in this file 

// include check and validationResult
const { check, validationResult } = require("express-validator"); 


showsRouter.use(express.json()); 
showsRouter.use(express.urlencoded({extended: true})); 

// works :)
// gets all of the show info
showsRouter.get("/", async (request, response) => {
    const shows = await Show.findAll({});
    response.json(shows); // returns all the info
})

// works :) 
// gets the show info by the endpoint with a param (/show/id)
showsRouter.get("/:id", async (request, response) => {
    const number = request.params.id;
    const shows = await Show.findByPk(number);
    response.json(shows) // returns the info with that specific id 
})

// DOESNT WORK ON POSTMAN
// get all the users who have watched that show using an enpoint with a param (users/id/shows)
showsRouter.get("/:id/users", async (request, response) => {
    const showId = request.params.id;
    const show = await User.findByPk(showId, {
        include: [{ model: User, through: { attributes: [] }}] // ensures that User can be accessed
    });

    if(!show) {
        return response.status(404).json({ message: "Show not found"})
    }

    response.json(show.User) // returns the users who have watched that show
})

// works :) 
// put updates the info 
showsRouter.put("/:id", async (request, response) => {
    const updatedShows = await Show.update(request.body, {where: {id: request.params.id}});
    let shows = await Show.findAll()
    response.json(shows);
})

// DOESNT WORK
// update the 'available' property of a show using a put endpoint with a param
// for example, /shows/3/available should update the third show in the database's available property to either true or false
showsRouter.put("/:id/available", async (request, response) => {
    const showId = request.params.id;
    const available = request.body.available;
    const show = await Show.findByPk(showId);
    if (!show){
        return response.status(404).json({ message: "Show not found"})
    }
    show.available = available
    
    await Show.update({ available }, { where: { id: showId } });

    return response.status(200).json(show);
});


// deletes the info - deletes a show by the id num
showsRouter.delete("/:id", async (request, response) => {
    const deletedShow = await Show.destroy({where: {id: request.params.id}});
    let shows = await Show.findAll()
    response.json(shows)
})

// checks all post - combine all posts together 
showsRouter.post("/",  // checks that nothing is left blank
    [
        check("title").not().isEmpty().trim().withMessage("Title is required"),
        check("genre").not().isEmpty().trim().withMessage("Genre is required"),
        check("rating").not().isEmpty().trim().withMessage("Rating is required"),
        check("available").not().isEmpty().trim().withMessage("Available is required"),
    ],
    async (request, response) => {
    const errors =validationResult(request);
        if(!errors.isEmpty()){
            response.json({error: errors.array()}) // if something is left blank, it returns the error
        }
        else{
            const show = await Show.create(request.body);
            const newShow = await Show.findAll({}) // if its not left blank, a new show is added 
            response.json(newShow) // returns the newly added show info
        }
})

module.exports = showsRouter