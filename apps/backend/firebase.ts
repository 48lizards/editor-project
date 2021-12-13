import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

// eslint-disable-next-line
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

export default getFirestore()