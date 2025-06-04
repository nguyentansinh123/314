const httpMocks     = require('node-mocks-http')
const jwt           = require('jsonwebtoken')
const userModel     = require('../models/user.model')
const transporter   = require('../config/nodemailer')
const {
  register,
  login,
  logOut,
  sendVerifyOtp,
  verifiedEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword
} = require('../controller/auth.controller')

jest.mock('../models/user.model')
jest.mock('bcryptjs', () => ({
  hash:    jest.fn().mockResolvedValue('h'),
  compare: jest.fn().mockResolvedValue(true)
}))
jest.mock('../config/nodemailer')
jest.mock('jsonwebtoken')

describe('auth.controller', () => {
  afterEach(() => jest.clearAllMocks())

  it('register errors on missing fields', async () => {
    const req = httpMocks.createRequest({ body: {} })
    const res = httpMocks.createResponse()
    await register(req, res)
    expect(res._getJSONData()).toEqual({ success: false, message: 'Missing details' })
  })
})