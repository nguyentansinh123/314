const httpMocks   = require('node-mocks-http')
const UserModel   = require('../models/user.model')
const cloudinary  = require('../config/cloudinary')
const {
  getAllUser,
  editUser,
  deleteUser,
  updateProfile
} = require('../controller/user.controller')

jest.mock('../models/user.model')
jest.mock('../config/cloudinary')

describe('user.controller', () => {
  afterEach(() => jest.clearAllMocks())

  it('getAllUser 404 when no users found', async () => {
    UserModel.find.mockResolvedValue(null)
    const req = httpMocks.createRequest()
    const res = httpMocks.createResponse()
    await getAllUser(req, res)
    expect(res.statusCode).toBe(404)
  })
})