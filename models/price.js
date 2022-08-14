const mongoose = require('mongoose')
const { db } = require('../connections/dbConnection.js')

const priceSchema = new mongoose.Schema({
	price: {
		type: Number,
		default: 0,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: { type: Date },
})

const Price = db.model('Price', priceSchema)
module.exports = { Price }
