const httpMocks = require('node-mocks-http')
const Event     = require('../models/event.model')
const cloudinary= require('../config/cloudinary')
const {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  cancelEvent,
  publishEvent,
  addTicketType,
  updateTicketType,
  deleteTicketType,
  getMyEvents
} = require('../controller/event.controller')

jest.mock('../models/event.model')
jest.mock('../config/cloudinary')

describe('event.controller', () => {
  afterEach(() => jest.clearAllMocks())

  it('createEvent errors on missing fields', async () => {
    const req = httpMocks.createRequest({ body: {} })
    const res = httpMocks.createResponse()
    await createEvent(req, res)
    expect(res.statusCode).toBe(400)
  })

  it('getAllEvents returns filtered events', async () => {
    const fakeList = [{ title: 'E1' }]
    Event.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort:     jest.fn().mockResolvedValue(fakeList)
    })
    const req = httpMocks.createRequest({ query: { status: 'published' } })
    const res = httpMocks.createResponse()
    await getAllEvents(req, res)
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData().data).toEqual(fakeList)
  })
})