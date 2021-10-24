import express, { Request, Response } from 'express'
import { query, validationResult } from 'express-validator'
import { Meeting, validateMeeting } from '../models/meeting'
import { handleError, removeAllEmptyField, getIsValidId } from '../utils'

const router = express.Router()

router.get(
  '/meeting',
  async (req: Request, res: Response) => {
    const { id, hostEmail } = req.query

    if (id) {
      // TODO: should be done same as rest of validation of user's input
      // but need to figure out how to make it optional if not presented
      if (id.length !== 24) {
        return res.status(400).send('Invalid id format')
      }
      try {
        const meeting = await Meeting.findOne({ _id: id })
        if (!meeting) {
          return res.status(404).send('Requested meeting does not exist')
        }
        return res.status(200).send(meeting)
      } catch(err) {
        return handleError(err as Error, res)
      }
    }

    const query = hostEmail ? { hostEmail } : {}
    let meeting
    try {
      meeting = await Meeting.find(query)
    } catch(err) {
      return handleError(err as Error, res)
    }
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
    return handleError(err as Error, res)
  }

  return res.status(201).send(meeting)
})

// TODO: add validation, but at the same point all fields should be optional
router.patch(
  '/meeting',
  [query('id', 'Id is required').notEmpty().bail().custom(getIsValidId)],
  async (req: Request, res: Response) => {
    const errors = validationResult(req).array()
    if (errors.length > 0) {
      return res.status(400).send(errors)
    }

    const { id } = req.query
    const { name, hostEmail, dateTime, attendeeEmailsList } = req.body
    const fieldToUpdate = { name, hostEmail, dateTime, attendeeEmailsList }

    try {
      await Meeting.updateOne(
        { _id: id },
        { $set: removeAllEmptyField(fieldToUpdate) },
      )
      return res.status(200).send('Updated')
    } catch(err) {
      return handleError(err as Error, res)
    }
  },
)

router.delete(
  '/meeting',
  [
    query('id', 'Id is required').notEmpty().bail().custom(getIsValidId),
    query('hostEmail', 'Host\'s email is invalid').notEmpty().bail().isEmail(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req).array()
    if (errors.length > 0) {
      return res.status(400).send(errors)
    }

    const { id, hostEmail } = req.query

    try {
      const meeting = await Meeting.findOne({ _id: id })
      if (!meeting) {
        return res.status(404).send('Requested meeting does not exist')
      }
      if (hostEmail !== meeting.hostEmail) {
        return res.status(403).send('You have to be the host of the meeting to delete it.')
      }

      await Meeting.deleteOne({ _id: id })
      return res.status(204).send()
    } catch(err) {
      return handleError(err as Error, res)
    }
  },
)

export { router as meetingRouter }