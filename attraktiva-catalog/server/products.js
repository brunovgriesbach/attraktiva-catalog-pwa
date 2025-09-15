/* eslint-env node */
import fs from 'fs'
import csv from 'csv-parser'

const products = []

await new Promise((resolve, reject) => {
  fs.createReadStream(new URL('./products.csv', import.meta.url))
    .pipe(csv({ separator: ';' }))
    .on('data', (row) => {
      products.push({
        id: Number(row.id),
        name: row.name,
        description: row.description,
        price: Number(row.price),
        image: row.image,
      })
    })
    .on('end', resolve)
    .on('error', reject)
})

export { products }
