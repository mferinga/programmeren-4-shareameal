let userDatabase = [];
let id = 0;

let controller = {
    addUser:(req, res)=>{
        let user = req.body;
        user = {
            id,
            ...user,
        };
        id++;
        console.log(user);
        userDatabase.push(user);
        res.status(201).json({
            status: 201,
            result: userDatabase,
        });
    },
    getAllUsers:(req, res)=>{
        res.status(202).json({
            status: 202,
            result: userDatabase,
        });
    },
    getUserById:(req, res) =>{
        const userId = req.params.userId;
        console.log(`User met ID ${userId} gezocht`);
        let user = userDatabase.filter((item) => item.id == userId);
        if(user.length > 0){
            console.log(user);
            res.status(204).json({
                status : 204,
                result: user,
            });
        } else {
            res.status(401).json({
            status: 401,
            result: `User with Id ${userId} is not found`
            });
        }
    },
}

module.exports = controller;