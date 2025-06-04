const httpMocks    = require('node-mocks-http')
const Registration = require('../models/registration.model')
const Event        = require('../models/event.model')
const { registerForEvent } = require('../controller/registration.controller')

jest.mock('../models/registration.model')
jest.mock('../models/event.model')

describe('registration.controller', () => {
  afterEach(() => jest.clearAllMocks())

  it('should 400 if already registered', async () => {
    Registration.findOne.mockResolvedValue(true)
    const req = httpMocks.createRequest({ body: { eventId: 'e', userId: 'u' } })
    const res = httpMocks.createResponse()
    await registerForEvent(req, res)
    expect(res.statusCode).toBe(400)
  })
})