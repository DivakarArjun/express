const mongoose = require('mongoose')
const { db } = require('../connections/dbConnection.js')

const userSessionSchema = new mongoose.Schema({
	uuid: {
		type: String,
	},
    userid:{type:String},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: { type: Date },
})

const UserSession = db.model('UserSession', userSessionSchema)
module.exports = { UserSession }

