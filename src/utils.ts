import { Response } from 'express'

export const handleError = (err: Error, res: Response) => {
  if (err.toString().includes('ECONNREFUSED')) {
    return res.status(503).send('Lost connection with database')
  }
  return res.status(500).send('What have you done?! It was working a while ago!')
}

export const removeAllEmptyField = (obj: Object) => (
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v))
)

export const getIsValidId = (id: string) => {
  if (id.length !== 24) {
    return Promise.reject('Invalid id format')
  }
  return Promise.resolve()
}

// TODO: extract isEmail somehow from express-validator
const validEmailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export const getIsValidEmail = (email: string) => (
  validEmailRegex.test(email)
)