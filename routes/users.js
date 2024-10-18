// linking and requiring everything 
const express = require("express");
const usersRouter = express.Router();
const { User, Show } = require("../models/index")

// include check and validationResult
const { check, validationResult } = require("express-validator"); 

usersRouter.use(express.json()); 
usersRouter.use(express.urlencoded({extended: true})); 

// works :) 
// get just gets the info
usersRouter.get("/", async (request, response) => {
    const users = await User.findAll({});
    response.json(users); // returns all the info
})

// works :) 
// gets the info by the id name
usersRouter.get("/:id", async (request, response) => {
    const userId = request.params.id;
    const users = await User.findByPk(userId);
    response.json(users)
})

// DOESNT WORK - could not send request
// usersRouter.get("/:id/shows", async (request, response) => {
//     const id = request.params.id;
//     const user = await User.findByPk(id, {
//         include: Show  // ensures that Show can be accessed
//     });

//     if(!user) {
//         return response.status(404).json({ message: "User not found"})
//     }

//     response.json(user.shows) // returns the atched by the user with that id 
// })

// works :) 
// get all the shows watched by one user using an enpoint with a param (users/id/shows)
usersRouter.get("/:id/shows", async (request, response) => {
    const userId = request.params.id
    if(!(await User.findByPk(userId))){
        response.json({error: "User not found"});
    }
    const user = await User.findByPk(userId, {
        include: {
            model: Show,
            through: { attributes: [] }
        }
    });
    response.json(user.shows)
})

// works :) 
// put updates the info
usersRouter.put("/:id", async (request, response) => {
    const updatedUsers = await User.update(request.body, {where: {id: request.params.id}});
    let users = await User.findAll()
    response.json(users);
})

// DOESNT WORK - comes back with error message 
// associate a user with a show they have watched using a put endpoint
// e.g. /users/2/shows/1 should update the third user in the database to have watched the first show in the data base
// usersRouter.put("/:userId/shows/:showId", async (request, response) => {
//     const userId = request.params.userId
//     const showId = request.params.showId;
//     const user = await User.findByPk(userId);
//     const show = await Show.findByPk(showId);

//     await user.addShow(show);

//     let foundUser = await Show.findByPk(userId, {include: Show});
//     response.json(foundUser)
// });

// works :) 
usersRouter.put("/:userId/shows/:showId", async (request, response) => {
    const userId = request.params.userId;
    const showId = request.params.showId;

    const user = await User.findByPk(userId);
    const show = await Show.findByPk(showId);

    if (!user) {
        return response.status(404).json({ message: "User not found" });
    }

    if (!show) {
        return response.status(404).json({ message: "Show not found" });
    }

    await user.addShow(show);

    const updatedUser = await User.findByPk(userId, { include: Show });
    response.json(updatedUser);
});

// deletes the info 
usersRouter.delete("/:id", async (request, response) => {
    const deletedUser = await User.destroy({where: {id: request.params.id}});
    let users = await User.findAll()
    response.json(users)
})

// checks all post - combine all posts together 
usersRouter.post("/", 
    [
        check("username").not().isEmpty().trim().withMessage("Username is required").isEmail().withMessage("Username must be an email"),
        check("password").not().isEmpty().trim().withMessage("Password is required"),
    ],
    async (request, response) => {
    const errors =validationResult(request);
        if(!errors.isEmpty()){
            response.json({error: errors.array()})
        }
        else{
            const user = await Restaurant.create(request.body);
            const newUser = await Restaurant.findAll({})
            response.json(newUser)
        }
})

module.exports = usersRouter