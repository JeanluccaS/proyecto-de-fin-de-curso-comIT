const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const autentification = require("./autentification");
const persons = require("./persons");
const expSesion = require("express-session");
const session = require("express-session");
const multer = require("multer");

const app = express();
const HTTP_PORT = 5000;

const uploadStorage = multer.diskStorage({
    destination: (req, file, setFolderCallback) => {
        setFolderCallback(null, './server/public/img/profile')
    },
    filename: (req, file, setFilenameCallback) => {
        setFilenameCallback(null, req.session.userLogged + path.extname(file.originalname));
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
    res.render("login", { layout: "landing" });
});
app.get("/registrarse", (req, res) => {
    res.render("registerAcount", { layout: "landing" })
});
app.get("/home", (req, res) => {
    res.render("home", { layout: "main" })
});

app.get("/login", (req, res) => {
    res.render("login", { layout: "landing" });
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
                class: "todoOk",
                text: "primero necesita iniciar sesion"
            }
        }

    }
})

app.listen(HTTP_PORT, () => {
    console.log(`Iniciando en: http://localhost:${HTTP_PORT}`);
});

app.post("/register", (req, res) => {

    autentification.getUser(req.body.user, result => {
        if (!result.success) //si no pude consultar la DB
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
        if (result.user) { //si encuentra un usuario:
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
                res.render("registerUser", {
                    layout: "landing",
                    message: {
                        class: "todoOk",
                        text: "Registrado correctamente, por favor ingrese sesion "
                    }
                })
            }
        })
    })
});

app.post("/registerUser", (req, res) => {
    console.log(req.body);
    autentification.getUser(req.body.user, result => {
        if (!result.success) //si no pude consultar la DB
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
        if (result.user) { //si encuentra un usuario:
            res.render("registerAcount", {
                layout: "landing",
                message: {
                    class: "error",
                    text: "Lo siento, ese usuario ya existe, ingrese otro nombre."
                }
            });
            return;
        }
        
        autentification.validUserData(req.body.user, req.body.surname, req.body.profilePic, result => {

        });
    });
});
app.post("/login", (req, res) => {
    console.log(req.body);
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


            res.render("home", {
                layout: "main",
                message: {
                    class: "todoOk",
                    text: "TODo genial master"
                }
            });
        }


    });

});

app.get("/search", (req, res) => {

    if (req.session.userLogged) {
        persons.getByname(req.query.name, result => {
            if (result.success) {
                res.render("profile", {
                    layout: "main",
                    person: result.user,
                    user: req.session.userLogged
                });
            } else {
                res.render("home", {
                    layout: "main",
                    message: {
                        class: "todoOk",
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


app.post("/changePic", upload.single('profilePic'), (req, res) => {
   
   
    if (req.session.userLogged) {
        if(req.file){
            console.log("encontre algo");
        }else{
            console.log("no encontre nada");
        }


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



