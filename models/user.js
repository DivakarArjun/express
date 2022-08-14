const mongoose = require('mongoose')
const { db } = require('../connections/dbConnection.js')

const userSchema = new mongoose.Schema({
	uuid: {
		type: String,
	},
	email: {
		type: String,
		unique: true,
	},
	companyName: String,
	password: {
		type: String,
		required: true,
		select: false,
	},
	acc_name: { type: String },
	acc_number: { type: String },
	ifsc: { type: String },
	tron_key: { type: String },
	binance_key: { type: String },
	baseToken: { type: String },
	userSelfie: { type: Object },
	adharCard: { type: Object },
	companyProof: { type: Object },
	bankAccount: { type: Object },
	gstDocument: { type: Object },
	panCard: { type: Object },
	kycAuthorization: { type: Object },
	authSecret:{type:String,default:null},
	isAuth:{type:Boolean,default:false},
	passwordChangedAt: Date,
	accountType: { type: String },
	isVerified: { type: Boolean, default: false },
	isBank: { type: Boolean, default: false },
	isKey: { type: Boolean, default: false },
	isKYC: { type: Boolean, default: false },
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: { type: Date },
})

const User = db.model('User', userSchema)
module.exports = { User }

