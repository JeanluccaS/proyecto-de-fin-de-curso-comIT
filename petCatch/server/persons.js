const mongoDb = require("mongodb");
const mongoURL = "mongodb://localhost:27017";

const getByname = (nameUser, cbResult) => {
    mongoDb.MongoClient.connect(mongoURL, (err, client) => {
        if (err) {
            cbResult({
                success: false
            })
        } else {
            const petCatchDB = client.db("petCatch");
            const persons = petCatchDB.collection("persons");

            persons.findOne({ name: nameUser }, (err, result) => {
                if (err) {
                    cbResult({
                        success: false
                    })
                }else if(!result)
                {
                    cbResult({
                        success: false
                    })
                }else {
                    console.log(result);
                    cbResult({
                        success: true,
                        user: result
                    
                    })
                }
            })
        }
    })
}

module.exports = {
    getByname
}