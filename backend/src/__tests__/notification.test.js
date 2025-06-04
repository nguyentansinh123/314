const httpMocks    = require('node-mocks-http')
const Notification = require('../models/notification.model')
const { getUserNotifications } = require('../controller/notification.controller')

jest.mock('../models/notification.model')

describe('notification.controller', () => {
  it('getUserNotifications returns list', async () => {
    const fakeNotes = [{ title: 'N' }]
    Notification.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeNotes)
    })
    const req = httpMocks.createRequest({ body: { userId: 'u' } })
    const res = httpMocks.createResponse()
    await getUserNotifications(req, res)
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData().notifications).toEqual(fakeNotes)
  })
})