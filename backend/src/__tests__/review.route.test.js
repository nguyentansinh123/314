const httpMocks = require('node-mocks-http')
const Review    = require('../models/review.model')
const { createOrUpdateReview } = require('../controller/review.controller')

jest.mock('../models/review.model')

describe('review.controller', () => {
  afterEach(() => jest.clearAllMocks())

  it('createOrUpdateReview creates new when none exists', async () => {
    Review.findOne.mockResolvedValue(null)
    Review.create = jest.fn().mockResolvedValue({ event: 'e', user: 'u' })
    const req = httpMocks.createRequest({ body: { event: 'e', userId: 'u', rating: 5 } })
    const res = httpMocks.createResponse()
    await createOrUpdateReview(req, res)
    expect(res.statusCode).toBe(201)
  })
})