/* eslint-env node */
import express from 'express'
import cors from 'cors'
import webPush from 'web-push'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
app.use(cors())
app.use(express.json())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const productsCsvPath = path.resolve(__dirname, '../public/products.csv')

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    'mailto:example@example.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  )
}

const subscriptions = []

app.post('/api/subscribe', (req, res) => {
  const subscription = req.body
  subscriptions.push(subscription)
  res.status(201).json({})
})

app.post('/api/push', async (req, res) => {
  const payload = JSON.stringify(req.body)
  const sendPromises = subscriptions.map((sub) =>
    webPush.sendNotification(sub, payload),
  )
  await Promise.allSettled(sendPromises)
  res.json({ sent: subscriptions.length })
})

app.get('/products.csv', (req, res) => {
  res.sendFile(productsCsvPath)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
