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
                    cbResult(newUser);
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
                            client.close();
                        })
                    }

                }
                client.close();
            })
        }
    })
}
const validUserData = (newData, cbResult) => {
    mongoDb.MongoClient.connect(mongoURL, (err, client) => {
        if (err) {
            cbResult(false)
        } else {
            const petCatchDB = client.db("petCatch");
            const persons = petCatchDB.collection("persons");

            persons.insertOne(newData, (err, result) => {
                if (err) {
                    cbResult(false);
                } else {
                    cbResult(true);
                }
                client.close();
            })
        }
    });
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
         
            const uptdatePic = {
                $set: {
                    profilePic: newPic.photo
                }
            }
         
            persons.updateOne(findUser, uptdatePic, (err, result) => {

                if (err) {
                    cbResult(false)
                } else {

                    cbResult(true)
                }
                client.close();
            })
        }
    })
}
const getPostUser = (user,cbResult)=>{
    mongoDb.MongoClient.connect(mongoURL, (err, client) => {
        if (err) {
            cbResult({
                success: -1
            })
        } else {
            const petCatchDB = client.db("petCatch");
            const persons = petCatchDB.collection("persons");

            persons.findOne({userName :user},(err,result)=>{
                if(err)
                {
                    cbResult(false)
                }else{
                   cbResult(result.myPostings) 
                }
            })


        }
    });
}
const addPost = (user, post, cbResult) => {
    mongoDb.MongoClient.connect(mongoURL, (err, client) => {
        if (err) {
            cbResult({
                success: -1
            })
        } else {
            const petCatchDB = client.db("petCatch");
            const persons = petCatchDB.collection("persons");

            findQuery = {
                userName: user
            }

            newPost = {
                $push: {
                    myPostings: post.myPostings
                }
            }

            persons.updateOne(findQuery, newPost, (err, result) => {
                if (err) {
                    cbResult(false);
                } else if (result) {
                    
                    cbResult({myPost:newPost});
                }
                client.close();
            })


        }
    });

}
module.exports = {
    getUser,
    validUserAcount,
    validLogin,
    changeProfilePic,
    validUserData,
    addPost,
    getPostUser,
}

