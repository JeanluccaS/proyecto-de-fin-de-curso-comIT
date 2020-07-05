const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const autentification = require("./autentification");
const persons = require("./persons");
const expSesion = require("express-session");
const session = require("express-session");
const multer = require("multer");
const { resolveNaptr } = require("dns");

const app = express();
const HTTP_PORT = 5000;

const uploadStorage = multer.diskStorage({
    destination: (req, file, setFolderCallback) => {
        setFolderCallback(null, './server/public/img/profile')
    },
    filename: (req, file, setFilenameCallback) => {
        setFilenameCallback(null, new Date().getTime() + path.extname(file.originalname));
    }
});


const upload = multer({ storage: uploadStorage });

app.set("view engine", "handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layout")
}));

app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }))


app.use(expSesion({
    secret: "Es un secreto ",
    resave: false,
    saveUninitialized: false
}))

app.get("/", (req, res) => {
    res.redirect("login");
});
app.get("/registrarse", (req, res) => {
    res.render("registerAcount", { layout: "landing" })
});
app.get("/home", (req, res) => {
    if (req.session.userLogged) {
        const user = req.session.userLogged
        autentification.getPostUser(user, result => {


            if (result) {

                res.render("home", { layout: "main", post: result })
            }
        })
    } else {
        req.session.message = {
            class: "error",
            text: "Error, debe iniciar sesion primero"
        }
        res.redirect("/login")
    }


});

app.get("/login", (req, res) => {
    res.render("login", { layout: "landing", message: req.session.message });
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render("login", { layout: "landing" })
});

app.get("/profile", (req, res) => {
    if (req.session.userLogged) {
        res.render("profile", { layout: "main", message: req.session.message });
    } else {
        res.render("login"), {
            layout: "landing",
            message: {
                class: "error",
                text: "primero necesita iniciar sesion"
            }
        }

    }
})

app.listen(HTTP_PORT, () => {
    console.log(`Iniciando en: http://localhost:${HTTP_PORT}`);
});

app.post("/registerAcount", (req, res) => {

    autentification.getUser(req.body.user, user => {
        if (!user.success) //si no pude consultar la DB
        {
            res.render("registerAcount", {
                layout: "landing",
                message: {
                    class: "error",
                    text: "Lo siento, estamos en mantenimiento, por favor, reintente registrarse, mas tarde"
                }
            });
            return;
        }
        if (user.user) { //si encuentra un usuario:
            res.render("registerAcount", {
                layout: "landing",
                message: {
                    class: "error",
                    text: "Lo siento, ese usuario ya existe, ingrese otro nombre."
                }
            });
            return;
        }

        if (!req.body.password || (req.body.password !== req.body.passwordConfirm)) { //valida que las contraseñas no sean
            res.render("registerAcount", {
                layout: "landing",
                message: {
                    class: "error",
                    text: "Lo siento, las contraseñas deben coincidir."
                }
            });
            return;
        }

        autentification.validUserAcount(req.body.user, req.body.password, result => {
            if (!result) {
                res.render("registerAcount", {
                    layout: "landing",
                    message: {
                        class: "error",
                        text: "Lo siento, estamos en mantenimiento, por favor, reintente registrarse, mas tarde"
                    }
                });
            } else {
                req.session.newUser = result;

                res.render("registerUser", {
                    layout: "landing"
                })
            }
        })
    })
});

app.post("/registerUser", upload.single('profilePic'), (req, res) => {


    const newData = {
        userName: req.session.newUser.name,
        name: req.body.user,
        surname: req.body.surname,
        profilePic: req.file.filename,
        myPostings: []
    }

    autentification.validUserData(newData, result => {
        if (result) {
            req.session.message = {
                class: "todoOk",
                text: "Registrado correctamente, por favor ingrese sesion "
            }
            res.redirect("/login");
        }
    });
});

app.post("/login", (req, res) => {


    autentification.validLogin(req.body.user, req.body.password, result => {
        if (result.success === -1) {
            res.render("login", {
                layout: "landing",
                message: {
                    class: "error",
                    text: "Lo siento, estamos en mantenimiento, por favor, reintente registrarse, mas tarde",
                }
            })
            return;
        }
        if (result.success === 0) {
            res.render("login", {
                layout: "landing",
                message: {
                    class: "error",
                    text: "Contraseña o usuarios incorrecto."
                }
            })
            return;
        } if (result.success === 1) {
            //guardar user logeado en sesion.
            req.session.userLogged = req.body.user;

            res.redirect("/home");
        }
    });
});

app.get("/search", (req, res) => {

    if (req.session.userLogged) {
        persons.getByname(req.query.name, result => {
            if (result.success) {
                req.session.profile = result.user;
                if (result.user.userName !== req.session.userLogged) {
                    res.render("profile", {
                        layout: "main",
                        person: req.session.profile,
                        user: req.session.userLogged,
                        myProfile: false
                    });
                } else {
                    res.render("profile", {
                        layout: "main",
                        person: result.user,
                        user: req.session.userLogged,
                        myProfile: true
                    });
                }

            } else {
                res.render("home", {
                    layout: "main",
                    message: {
                        class: "error",
                        text: "no se encontro ese usuario"
                    }
                });
            }
        })
    } else {
        res.render("login", {
            layout: "landing",
            message: {
                class: "error",
                text: "primero necesita iniciar sesion"
            }
        });
    }
});


app.get("/addFriend", (req, res) => {

    const newFriend = {
        myFriend: req.session.profile,
    }
    autentification.addFriend(req.session.userLogged, newFriend, result => {
        if (result) {

        } else {
            res.send(400);
        }
    })





})

app.post("/changePic", upload.single('profilePic'), (req, res) => {


    if (req.session.userLogged) {



        const newPic = {
            photo: req.file.filename
        }

        autentification.changeProfilePic(req.session.userLogged, newPic, result => {
            if (result) {
                res.redirect("/profile");
            } else {
                req.session.message = {
                    class: "error",
                    message: "no se pudo actualizar la foto de perfil, intentelo mas tarde",
                }
                res.redirect("/profile");
            }
        })



    }
})

app.post("/publicImage", upload.single('image'), (req, res) => {


    let day = new Date();

    day = day.toString(day);
    date = day.slice(3, 15);

    if (req.session.userLogged) {

        persons.getByUserName(req.session.userLogged, result => {
            if (result.success) {

                person = result.user
                const myPost = {
                    myPostings:
                    {
                        pictureName: req.file.filename,
                        pictureDescription: req.body.description,
                        dateUploeaded: date
                    }
                }
                autentification.addPost(person.userName, myPost, result => {

                    if (result) {

                        req.session.myPostings = result

                        res.redirect("/home");
                    } else {
                        console.log("todo mal");
                    }
                })
            } else {
                res.redirect("/login");
            }

        })
    }
})

