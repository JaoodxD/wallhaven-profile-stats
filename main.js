import Wallhaven from './lib/wallhaven.js'
import LocalStorage from './lib/localStorage.js'
import ProgressBar from 'progress'
const storage = LocalStorage('Jaood')
// const info = storage.addImage({
//   id: 'test',
//   colors: '#123',
//   path: 'some random url',
//   url: 'http://wallhaven.org'
// })

const API_KEY = process.env.WALLHAVEN_API_KEY
const wh = Wallhaven(API_KEY, 'Jaood')

const collections = await wh.userCollections()
console.log(collections)

for (const collection of collections) {
  const { id } = collection
  let currentPage = 0
  let lastPage = -1
  do {
    currentPage++
    const { data, meta } = await wh.collectionInfo(id, currentPage)
    lastPage = meta.last_page

    const bar = new ProgressBar(
      '  downloading [:bar] :rate/bps :percent :etas',
      {
        total: collection.count
      }
    )
    // console.log(meta)
    for (const image of data) {
      const { id, url, path, colors } = image
      const result = storage.addImage({ id, colors, path, url })
      const imageId = result.id
      // console.log({ id, imageId })
      const tags = await wh.wpTags(id)
      for (const tag of tags) {
        const { id: tagId, name } = tag
        storage.addTag({ name, id: tagId })
        storage.addImageTag({ imageId, tagId })
      }
      bar.tick(1)
    }
  } while (currentPage !== lastPage)
}

storage.close()
