/* eslint-env node */
import express from 'express'
import webPush from 'web-push'
import fs from 'fs'
import { parse } from 'csv-parse/sync'

const app = express()
app.use(express.json())

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

app.get('/api/products', (req, res) => {
  const csv = fs.readFileSync(new URL('./data/products.csv', import.meta.url))
  const records = parse(csv, { columns: true, skip_empty_lines: true })
  const products = records.map((p) => ({
    id: Number(p.id),
    name: p.name,
    description: p.description,
    price: Number(p.price),
    image: p.image,
  }))
  res.json(products)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
