import rateLimiter from './rate-limiter.js'
import retriable from './retriable.js'

const apiUrl = 'https://wallhaven.cc/api/v1'

export default function wallhaven (API_KEY, username) {
  const opts = { interval: 60 * 1000, intervalCap: 30 }
  const request = retriable(rateLimiter(fetch, opts))
  return {
    wpInfo,
    wpTags,
    tagInfo,
    userSettings,
    userCollections,
    collectionInfo
  }

  async function wpInfo (id) {
    const url = `${apiUrl}/w/${id}?apikey=${API_KEY}`
    const response = await request(url)
    const data = await response.json()
    return data
  }

  async function wpTags (id) {
    const { data } = await wpInfo(id)
    const { tags } = data
    return tags
  }

  function tagInfo () {}

  async function userSettings () {
    const url = `${apiUrl}/settings?apikey=${API_KEY}`
    const response = await request(url)
    const data = await response.json()
    return data
  }

  async function userCollections () {
    const url = `${apiUrl}/collections?apikey=${API_KEY}`
    const response = await request(url)
    const { data } = await response.json()
    return data
  }

  async function collectionInfo (id, page = 1) {
    const url = `${apiUrl}/collections/${username}/${id}?purity=111&page=${page}&apikey=${API_KEY}`
    const response = await request(url)
    try {
      const data = await response.json()
      return data
    } catch (err) {
      // console.error(err.message)
      return {}
    }
  }
}
