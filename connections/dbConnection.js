require('dotenv').config()
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_STRING, {
	maxPoolSize: 50, 
	wtimeoutMS: 2500,
	useNewUrlParser: true
})

const db = mongoose.connection
// CONNECTION EVENTS

// When successfully connected
db.on('connected', () => {
	console.log('Mongoose connection open to master DB')
})

// If the connection throws an error
db.on('error', (err) => {
	console.error(`Mongoose connection error for master DB: ${err}`)
})

// When the connection is disconnected
db.on('disconnected', () => {
	console.error('Mongoose connection disconnected for master DB')
})

// When connection is reconnected
db.on('reconnected', () => {
	console.log('Mongoose connection reconnected for master DB')
})
// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
	db.close(() => {
		console.error(
			'Mongoose connection disconnected for master DB through app termination'
		)
		// eslint-disable-next-line no-process-exit
		process.exit(0)
	})
})

module.exports = { db }
