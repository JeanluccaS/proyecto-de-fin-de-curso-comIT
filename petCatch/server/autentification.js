const mongoDb = require("mongodb");
const mongoURL = "mongodb://localhost:27017";



const getUser = (user, cbResult) => {
    mongoDb.MongoClient.connect(mongoURL, (err, client) => {
        if (err) {
            cbResult({
                success: false
            });
        } else {
            const petCatchDB = client.db("petCatch");
            const users = petCatchDB.collection("users");

            users.findOne({ name: user }, (err, result) => {
                if (err) {
                    cbResult({
                        success: false
                    })
                } else {
                    cbResult({
                        success: true,
                        user: result
                    });
                }
                client.close();
            });
        }
    });
}

const validUserAcount = (user, password, cbResult) => {
    mongoDb.MongoClient.connect(mongoURL, (err, client) => {
        if (err) {
            cbResult(false)
        } else {
            const petCatchDB = client.db("petCatch");
            const users = petCatchDB.collection("users");
            const newUser = {
                name: user,
                password: password
            }
            users.insertOne(newUser, (err, result) => {
                if (err) {
                    cbResult(false);
                } else {
                    cbResult(true);
                }
                client.close();

            });
        }
    });
}
const validLogin = (user, pass, cbResult) => {
    mongoDb.MongoClient.connect(mongoURL, (err, client) => {
        if (err) {
            cbResult({
                success: -1
            })
        } else {
            const petCatchDB = client.db("petCatch");
            const users = petCatchDB.collection("users");
            const persons = petCatchDB.collection("persons");
            users.findOne({ name: user, password: pass }, (err, result) => {
                if (err) {
                    cbResult({
                        success: -1
                    })
                } else {
                    if (!result) {
                        cbResult({
                            success: 0
                        })
                    } else {

                        persons.findOne({ userName: result.name }, (err, result) => {

                            if (err) {
                                cbResult({
                                    success: 0
                                })
                            } else {
                                cbResult({
                                    success: 1,
                                    user: result
                                })
                            }

                        })
                    }

                }
                client.close();
            })
        }
    })
}

const changeProfilePic = (user, newPic, cbResult) => {
    mongoDb.MongoClient.connect(mongoURL, (err, client) => {
        if (err) {
            cbResult({
                success: -1
            })
        } else {
            const petCatchDB = client.db("petCatch");
            const persons = petCatchDB.collection("persons");

            const findUser = {
                userName: user,
            }
            console.log(findUser);
            const uptdatePic = {
                $set: {
                    profilePic: newPic.photo
                }
            }
            console.log(uptdatePic);
            persons.updateOne(findUser, uptdatePic, (err, result) => {
              
                if (err) {
                    cbResult: false
                } else {

                    cbResult(true)
                }
            })
        }
    })
}
module.exports = {
    getUser,
    validUserAcount,
    validLogin,
    changeProfilePic,
}

