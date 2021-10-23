import { Model, Schema, Document, model } from 'mongoose'
import { body } from 'express-validator'

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

// TODO: extract isEmail somehow from express-validator
const validEmailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const validateMeeting = [
  body('hostEmail', 'Host\'s email is invalid').isEmail(),
  body('name', 'Name is empty').notEmpty(),
  body('attendeeEmailsList')
    .isArray()
    .withMessage('Attendee emails is not a list!')
    .bail()
    .custom((emailsList: string[]) => {
      const invalidEmails = emailsList.filter(email => !validEmailRegex.test(email))
      if (invalidEmails.length > 0) {
        return Promise.reject(`Attendee emails list contains invalid emails: ${invalidEmails.join()}`)
      }
      return Promise.resolve()
    })
]

export { Meeting, validateMeeting }