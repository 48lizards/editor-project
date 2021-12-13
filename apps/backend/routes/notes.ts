import express, { RequestHandler, Response } from 'express'
import { WebsocketRequestHandler } from 'express-ws'
import { Descendant } from 'slate'
import * as Y from 'yjs'
import db from '../firebase'

// Patch `express.Router` to support `.ws()` without needing to pass around a `ws`-ified app.
// https://github.com/HenningM/express-ws/issues/86
// eslint-disable-next-line @typescript-eslint/no-var-requires
const patch = require('express-ws/lib/add-ws-method')
patch.default(express.Router)

const router = express.Router()

export interface NotesResponse {
  notes: Array<{
    id: string
    title: string
  }>
}

export interface NoteResponse {
  id: string
  title: string
  content: Descendant[]
}

const notesHandler: RequestHandler = (_req, res: Response<NotesResponse>) => {
  db.collection('notes').get().then(
    (querySnapshot) => {
      res.json({
        notes: querySnapshot.docs.map(doc => ({ id: doc.id, title: doc.get('title') }))
      })
    }
  )
}

const noteHandler: WebsocketRequestHandler = (ws, req) => {
  ws.on('message', async (msg) => {
    console.log({ msg })
    const doc = db.doc(`notes/${req.params.id}`)
    const docSnapshot = await doc.get()
    const docData = docSnapshot.data()
    if (docData) {
      const yDoc = new Y.Doc()
      yDoc.getArray('content').insert(0, docData.content)
    }
    return ws.send(JSON.stringify(docSnapshot.data()))
    // if (msg) {
    // const note = {
    //   id: req.params.id,
    //   ...JSON.parse(msg.toString())
    // }
    // doc.set(note)
    // }
  })
}

router.get('/', notesHandler)
router.ws('/:id', noteHandler)

export default router