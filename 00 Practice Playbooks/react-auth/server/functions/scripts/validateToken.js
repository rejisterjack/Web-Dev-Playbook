const functions = require('firebase-functions')
const admin = require('../config/admin')
const cors = require('cors')
const corsHandler = cors({ origin: true })

exports.validateToken = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    const token = req.headers.authorization?.split('Bearer ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token)
      const user = await admin.auth().getUser(decodedToken.uid)
      return res.status(200).json(user)
    } catch (error) {
      console.error('Error verifying token:', error)
      return res.status(401).json({ error: 'Unauthorized' })
    }
  })
})
