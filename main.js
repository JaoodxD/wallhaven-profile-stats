import Wallhaven from './lib/wallhaven.js'
import LocalStorage from './lib/localStorage.js'
import ProgressBar from 'progress'

const storage = LocalStorage('Jaood')

const API_KEY = process.env.WALLHAVEN_API_KEY
const wh = Wallhaven(API_KEY, 'Jaood')

const collections = await wh.userCollections()
console.log(collections)
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
    lastPage = meta.last_page

    for (const image of data) {
      const { id, url, path, colors } = image
      const result = storage.addImage({ id, colors, path, url })
      const imageId = result.id
      const tags = await wh.wpTags(id)
      for (const tag of tags) {
        const { id: tagId, name } = tag
        storage.addTag({ name, id: tagId })
        storage.addImageTag({ imageId, tagId })
      }
      bar.tick(1)
    }
  } while (currentPage !== lastPage)
  bar.terminate()
  console.timeEnd(label)
}
console.timeEnd('total')

storage.close()
