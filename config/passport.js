const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/user');
const Admin = require('../models/admin');
const Manager = require('../models/manager');

function SessionConstructor(userId, userGroup, details) {
	this.userId = userId;
	this.userGroup = userGroup;
	this.details = details;
}

module.exports = function (passport) {
	passport.use(
		'local-user-signup',
		new LocalStrategy(
			{
				usernameField: 'email'
			},
			(email, password, done) => {
				User.findOne({ email: email })
					.then(user => {
						if (!user) {
							return done(null, false, {
								message: 'That email is not registered'
							});
						}

						bcrypt.compare(password, user.password, (err, isMatch) => {
							if (err) throw err;
							if (isMatch) {
								return done(null, user);
							} else {
								return done(null, false, { message: 'Contraseña Incorrecta' });
							}
						});
					})
					.catch(err => console.log(err));
			}
		)
	);

	passport.use(
		'local-admin-signup',
		new LocalStrategy(
			{
				usernameField: 'email'
			},
			(email, password, done) => {
				Admin.findOne({ email: email })
					.then(user => {
						if (!user) {
							return done(null, false, {
								message: 'Ese email no esta registrado'
							});
						}

						bcrypt.compare(password, user.password, (err, isMatch) => {
							if (err) throw err;
							if (isMatch) {
								return done(null, user);
							} else {
								return done(null, false, { message: 'Contraseña Incorrecta' });
							}
						});
					})
					.catch(err => console.log(err));
			}
		)
	);

	passport.use(
		'local-manager-signup',
		new LocalStrategy(
			{
				usernameField: 'email'
			},
			(email, password, done) => {
				Manager.findOne({ email: email })
					.then(user => {
						if (!user) {
							// req.flash("error_msg", "Ese email no esta registrado")
							return done(null, false, {
								message: 'Ese email no esta registrado'
							});
						}

						bcrypt.compare(password, user.password, (err, isMatch) => {
							if (err) throw err;
							if (isMatch) {
								return done(null, user);
							} else {
								// req.flash("error_msg", "Contraseña Incorrecta")
								return done(null, false, { message: 'Contraseña Incorrecta' });
							}
						});
					})
					.catch(err => console.log(err));
			}
		)
	);

	passport.serializeUser((userObject, done) => {
		let userGroup = 'admin';
		let userPrototype = Object.getPrototypeOf(userObject);

		if (userPrototype === Admin.prototype) {
			userGroup = 'admin';
		} else if (userPrototype === User.prototype) {
			userGroup = 'user';
		} else if (userPrototype === Manager.prototype) {
			userGroup = 'manager';
		}

		let sessionConstructor = new SessionConstructor(
			userObject.id,
			userGroup,
			''
		);
		done(null, sessionConstructor);
	});

	passport.deserializeUser((sessionConstructor, done) => {
		if (sessionConstructor.userGroup == 'admin') {
			Admin.findOne(
				{
					_id: sessionConstructor.userId
				},
				'-localStrategy.password',
				(err, user) => {
					done(err, user);
				}
			);
		} else if (sessionConstructor.userGroup == 'user') {
			User.findOne(
				{
					_id: sessionConstructor.userId
				},
				'-localStrategy.password',
				(err, user) => {
					done(err, user);
				}
			);
		} else if (sessionConstructor.userGroup == 'manager') {
			Manager.findOne(
				{
					_id: sessionConstructor.userId
				},
				'-localStrategy.password',
				(err, user) => {
					done(err, user);
				}
			);
		}
	});
};
