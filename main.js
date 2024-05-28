import Wallhaven from './lib/wallhaven.js'
import LocalStorage from './lib/localStorage.js'
import ProgressBar from 'progress'
import { setTimeout } from 'node:timers/promises'

const API_KEY = process.env.WALLHAVEN_API_KEY
const USERNAME = process.env.WALLHAVEN_USERNAME
const wh = Wallhaven(API_KEY, USERNAME)
const storage = LocalStorage(USERNAME)

const collections = await wh.userCollections()
console.log(collections)
let total = 0
console.time('total')
for (const collection of collections) {
  const { id, label, count } = collection
  console.time(label)
  let currentPage = 0
  let lastPage = -1
  const bar = new ProgressBar(`  ${label} [:bar] :rate/bps :percent :etas`, {
    total: count
  })
  do {
    currentPage++
    const { data, meta } = await wh.collectionInfo(id, currentPage)
    if (!data) {
      await setTimeout(5000)
      continue
    }
    lastPage = meta.last_page
    let skipped = 0
    for (const image of data) {
      const { id, url, path, colors } = image
      const exists = storage.imageExists(id)
      bar.tick(1)
      if (exists) {
        skipped++
        continue
      }
      const result = storage.addImage({ id, colors, path, url })
      const imageId = result.id
      total++
      const tags = await wh.wpTags(id)

      if (!tags) continue

      for (const tag of tags) {
        const { id: tagId, name } = tag
        storage.addTag({ name, id: tagId })
        storage.addImageTag({ imageId, tagId })
      }
    }
    if (skipped === data.length) break
  } while (currentPage !== lastPage)
  bar.terminate()
  console.timeEnd(label)
}
console.timeEnd('total')
console.log('total new images info collected', total)
storage.close()
