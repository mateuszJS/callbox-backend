import { Model, Schema, Document, model } from 'mongoose'
import { body, query } from 'express-validator'
import { getIsValidEmail } from '../utils'

interface IMeeting {
  hostEmail: string
  name: string
  dateTime: number
  attendeeEmailsList: string[]
}

type IMeetingDoc = Document & IMeeting

interface IMeetingModelInterface extends Model<IMeetingDoc> {
  build(attr: IMeeting): IMeetingDoc
}

const meetingSchema = new Schema<IMeeting>({
  name: {
    type: String,
    required: true
  },
  hostEmail: {
    type: String,
    required: true
  },
  dateTime: {
    type: Number,
    require: true
  },
  attendeeEmailsList: {
    type: [String],
    require: true
  }
})

// I've added this additional method
// because directly creating Todos doesn't catch TS errors
meetingSchema.statics.build = (attr: IMeeting) => {
  try {
    const meeting = new Meeting(attr)
    return meeting
  } catch (err) {
    console.log(err)
    return err
  }
}

const Meeting = model<IMeetingDoc, IMeetingModelInterface>('Meeting', meetingSchema)

const validateMeeting = [
  body('hostEmail', 'Host\'s email is invalid').isEmail(),
  body('name', 'Name is empty').notEmpty(),
  body('dateTime', 'Date time is required').notEmpty(),
  body('attendeeEmailsList')
    .isArray()
    .withMessage('Attendee emails is not a list!')
    .bail()
    .custom((emailsList: string[]) => {
      const invalidEmails = emailsList.filter(email => !getIsValidEmail(email))
      if (invalidEmails.length > 0) {
        return Promise.reject(`Attendee emails list contains invalid emails: ${invalidEmails.join()}`)
      }
      return Promise.resolve()
    }),
]

export { Meeting, validateMeeting }