"use strict";

var databaseQuery = require('../config/database.js');
const bcrypt = require('bcrypt-nodejs');

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the login.ejs file
    });

    app.get('/login', function(req, res) {
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/checkAuth', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/checkAuth', function(req, res) {
      if (!req.user) {
          req.flash('loginMessage', "Something went wrong, re-login please");
          res.redirect('/login');
      } else if (req.user.role === 'Admin') {
          res.redirect('/admin');
        }
        else if (req.user.role === 'Teacher') {
          res.redirect('/teacher');
      } else {
          res.redirect('/login');
      }
    });


    app.get('/teacher', allowTeachers, function(req, res) {
        res.render('teacher/index.ejs', {
            message: req.flash('appMessage')
        });
    });

    app.get('/teacher/timetable', allowTeachers, function(req, res) {
        res.render('teacher/timetable.ejs', {
            message: req.flash('timetableMessage')
        });
    });

    app.get('/getTimetable', allowTeachers, function(req, res){
      databaseQuery.getTimetable(req.user.id)
          .then(function(data) {
              res.send(data);
          })
          .catch(function(e) {
              res.status(500, {
                  error: e
              });
          });
    });



    app.get('/admin', allowAdmins, function(req, res) {
        res.render('admin/admin.ejs', {
            message: req.flash('appMessage')
        });
    });

    app.get('/admin/parent', allowAdmins, function(req, res) {
        res.render('admin/parent.ejs', {
            user: req.user,
            message: req.flash('parentMessage')
        });
    });

    app.get('/admin/teacher', allowAdmins, function(req, res) {
        res.render('admin/teacher.ejs', {
            user: req.user,
            message: req.flash('teahcerMessage')
        });
    });

    app.get('/admin/pupil', allowAdmins, function(req, res) {
        res.render('admin/pupil.ejs', {
            user: req.user,
            message: req.flash('pupilMessage')
        });
    });

    app.get('/admin/room', allowAdmins, function(req, res) {
        res.render('admin/room.ejs', {
            user: req.user,
            message: req.flash('roomMessage')
        });
    });

    app.get('/admin/subject', allowAdmins, function(req, res) {
        res.render('admin/subject.ejs', {
            user: req.user,
            message: req.flash('subjectMessage')
        });
    });

    app.get('/admin/class', allowAdmins, function(req, res) {
        res.render('admin/class.ejs', {
            user: req.user,
            message: req.flash('profileMessage') // get the user out of session and pass to template
        });
    });

    app.get('/admin/profile', allowAdmins, function(req, res) {
        res.render('admin/profile.ejs', {
            user: req.user,
            message: req.flash('profileMessage')
        });
    });

    app.get('/admin/update', allowAdmins, function(req, res) {
        res.render('admin/update.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });


    app.get('/getParent', function(req, res) {
        databaseQuery.getParent(req.body)
            .then(function(data) {
                res.send(data);
            })
            .catch(function(e) {
                res.status(500, {
                    error: e
                });
            });
    });


    app.get('/getStudent', function(req, res) {
        databaseQuery.getStudent(req)
            .then(function(data) {
                res.send(data);
            })
            .catch(function(e) {
                res.status(500, {
                    error: e
                });
            });
    });

    app.get('/getTeacher', function(req, res) {
        databaseQuery.getTeacher(req.body)
            .then(function(data) {
                res.send(data);
            })
            .catch(function(e) {
                res.status(500, {
                    error: e
                });
            });
    });

    app.get('/getClass', function(req, res) {
        databaseQuery.getClass(req.body)
            .then(function(data) {
                res.send(data);
            })
            .catch(function(e) {
                res.status(500, {
                    error: e
                });
            });
    });

    app.get('/getRoom', function(req, res) {
        databaseQuery.getRoom(req.body)
            .then(function(data) {
                res.send(data);
            })
            .catch(function(e) {
                res.status(500, {
                    error: e
                });
            });
    });

    app.get('/getSubject', function(req, res) {
        databaseQuery.getSubject(req.body)
            .then(function(data) {
                res.send(data);
            })
            .catch(function(e) {
                res.status(500, {
                    error: e
                });
            });
    });

    app.post('/class', function(req, res) {
        databaseQuery.addClass(req.body)
            .then(function(data) {
                res.send(data);
            })
            .catch(function(e) {
                res.status(500, {
                    error: e
                });
            });
    });

    app.post('/room', function(req, res) {
        databaseQuery.addRoom(req.body)
            .then(function(data) {
                res.send(data);
            })
            .catch(function(e) {
                res.status(500, {
                    error: e
                });
            });
    });

    app.post('/subject', function(req, res) {
        databaseQuery.addSubject(req.body)
            .then(function(data) {
                res.send(data);
            })
            .catch(function(e) {
                res.status(500, {
                    error: e
                });
            });
    });


    app.post('/pupil', function(req, res) {
        //Store the unhashed password in a variable
        let unhashedPassword = req.body.Student_Password;
        //Hash the users password
        bcrypt.hash(unhashedPassword, null, null, function(err, hash) {
            //If there is a problem with hashing send me a message
            if (err) {
                return err;
            }
            //Chnage the value in the object to the new password
            req.body.Student_Password = hash;
            databaseQuery.addStudent(req.body).then(function(data) {
                    res.send(data);
                })
                .catch(function(e) {
                    res.status(500, {
                        error: e
                    });
                });
        });
    });

    app.post('/teacher', function(req, res) {
        //Store the unhashed password in a variable
        let unhashedPassword = req.body.Teacher_Password;
        //Hash the users password
        bcrypt.hash(unhashedPassword, null, null, function(err, hash) {
            //If there is a problem with hashing send me a message
            if (err) {
                return err;
            }
            //Chnage the value in the object to the new password
            req.body.Teacher_Password = hash;
            databaseQuery.addTeacher(req.body).then(function(data) {
                    res.send(data);
                })
                .catch(function(e) {
                    res.status(500, {
                        error: e
                    });
                });
        });
    });


    app.post('/parent', function(req, res) {
        //Store the unhashed password in a variable
        let unhashedPassword = req.body.Parent_Password;
        //Hash the users password
        bcrypt.hash(unhashedPassword, null, null, function(err, hash) {
            //If there is a problem with hashing send me a message
            if (err) {
                return err;
            }
            //Chnage the value in the object to the new password
            req.body.Parent_Password = hash;
            databaseQuery.addParent(req.body).then(function(data) {
                    res.send(data);
                })
                .catch(function(e) {
                    res.status(500, {
                        error: e
                    });
                });
        });
    });

    app.post('/update', function(req, res) {

        //Declare vars
        let email, username, id;
        //Get the information sent through by the profile page and store it in our variables
        email = req.body.email;
        username = req.body.username;
        id = req.user.id;

        //Run the function that goes to config/database.js to update the users settings
        databaseQuery.updateProfile(email, username, id);

        //This is the new information about the user
        let user = {
            id: req.user.id,
            name: req.user.name,
            email: email,
            username: username,
            password: req.user.password,
            privlidge: req.user.privlidge,
            role: req.user.role
        };

        //Have to re-log the user in to update the users information in session.
        req.logIn(user, function() {
            req.session.save(function() {
                res.redirect('/app/profile');
            });
        });

        req.flash('profileMessage', 'You have successfully updated your profile');
        res.redirect('app/profile');
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

//Allow Admin to view only Admin URI's
function allowAdmins(req, res, next) {
    if (!req.user) {
        req.flash('loginMessage', "Something went wrong, re-login please");
        res.redirect('/login');
    } else if (req.user.role === 'Admin') {
        return next();
    } else {
        req.flash('loginMessage', "Naughty, Naughty your not an admin!");
        res.redirect('/login');
    }
}

function allowTeachers(req, res, next) {
    if (!req.user) {
        req.flash('loginMessage', "Something went wrong, re-login please");
        res.redirect('/login');
    } else if (req.user.role === 'Teacher') {
        return next();
    } else {
        req.flash('loginMessage', "Naughty, Naughty your not an Teacher!");
        res.redirect('/login');
    }
}
