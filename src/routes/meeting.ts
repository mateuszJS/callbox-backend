import express, { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { Meeting, validateMeeting } from '../models/meeting'

const router = express.Router()

router.get(
  '/meeting',
  async (req: Request, res: Response) => {
    const meeting = await Meeting.find({})
    return res.status(200).send(meeting)
  }
)

router.post('/meeting', validateMeeting, async (req: Request, res: Response) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    return res.status(400).send(errors)
  }

  const { name, hostEmail, dateTime, attendeeEmailsList } = req.body
  const meeting = Meeting.build({ name, hostEmail, dateTime, attendeeEmailsList })

  try {
    await meeting.save()
  } catch(err) {
    return res.status(503).send('Lost connection with database')
  }

  return res.status(201).send(meeting)
})

export { router as meetingRouter }