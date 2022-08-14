const mongoose = require('mongoose')
const { db } = require('../connections/dbConnection.js')

const blogSchema = new mongoose.Schema({
	blogTitle: {
		type: String,
	},
	imageUrl: { type: String },
	blogDescription: { type: String },
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: { type: Date },
})

const Blog = db.model('Blog', blogSchema)
module.exports = { Blog }
