const httpMocks     = require('node-mocks-http')
const express       = require('express')
const request       = require('supertest')
const Message       = require('../models/message.model')
const User          = require('../models/user.model')
const socketModule  = require('../config/socket')
const cloudinary    = require('../config/cloudinary')
const {
  getUsersForSidebar,
  getMessages,
  sendMessage
} = require('../controller/message.controller')
const messageRoutes = require('../routes/message.route')

// mock everything
jest.mock('../models/message.model')
jest.mock('../models/user.model')
jest.mock('../config/socket')
jest.mock('../config/cloudinary')
jest.mock('../middleware/userAuth', () => (req, res, next) => {
  req.body.userId = 'u'; next()
})

const app = express()
app.use(express.json())
app.use('/api/messages', messageRoutes)

describe('message.controller', () => {
  afterEach(() => jest.clearAllMocks())

  describe('getUsersForSidebar', () => {
    it('returns user list', async () => {
      const fake = [{ _id: 'u1' }]
      // mock the chained call: find().select()
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(fake)
      })
      const req = httpMocks.createRequest({ body: { userId: 'u1' } })
      const res = httpMocks.createResponse()
      await getUsersForSidebar(req, res)
      expect(res.statusCode).toBe(200)
      expect(res._getJSONData()).toEqual({ success: true, users: fake })
    })
  })

  describe('GET /api/messages/users route', () => {
    it('responds 200', async () => {
      // for the route, mock find().select() too
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([])
      })
      const res = await request(app).get('/api/messages/users')
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('success')
    })
  })
})