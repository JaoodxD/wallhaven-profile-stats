import Database from 'better-sqlite3'
import fs from 'node:fs'

const IMAGES_TABLE_CREATION_SQL = `
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY,
  wh_id TEXT UNIQUE,
  colors TEXT,
  path TEXT,
  url TEXT
);`

const TAGS_TABLE_CREATION_SQL = `
CREATE TABLE IF NOT EXISTS tags (
  wh_id INTEGER PRIMARY KEY,
  name TEXT
);`

const IMAGE_TAGS_TABLE_CREATION_SQL = `
CREATE TABLE IF NOT EXISTS images_tags (
  id INTEGER PRIMARY KEY,
  image_id INTEGER,
  tag_id INTEGER,
  FOREIGN KEY (image_id) REFERENCES images(id),
  FOREIGN KEY (tag_id) REFERENCES tags(wh_id)
);
`

const CREATE_IMAGE_SQL = `
REPLACE INTO images (wh_id,  colors,  path,  url)
            VALUES (@wh_id, @colors, @path, @url)
RETURNING *;
`

const EXISTS_IMAGE_SQL = `
SELECT EXISTS (SELECT 1 FROM images WHERE wh_id = @wh_id) AS image_exists;`

const CREATE_TAG_SQL = `
REPLACE INTO tags (wh_id, name) VALUES (@wh_id, @name) RETURNING *;`

const CREATE_IMAGE_TAG_SQL = `
INSERT INTO images_tags (image_id, tag_id)
                 VALUES (@image_id, @tag_id);
`

export default function LocalStorage (login) {
  if (!fs.existsSync('./localStorage')) fs.mkdirSync('./localStorage')
  const db = Database(`./localStorage/${login}.db`)
  db.exec(IMAGES_TABLE_CREATION_SQL)
  db.exec(TAGS_TABLE_CREATION_SQL)
  db.exec(IMAGE_TAGS_TABLE_CREATION_SQL)

  const createImage = db.prepare(CREATE_IMAGE_SQL)
  const createTag = db.prepare(CREATE_TAG_SQL)
  const createImageTag = db.prepare(CREATE_IMAGE_TAG_SQL)

  const checkImage = db.prepare(EXISTS_IMAGE_SQL)

  return { addImage, imageExists, addTag, addImageTag, close }

  function addImage ({ id, colors, path, url }) {
    const payload = {
      wh_id: id,
      colors: JSON.stringify(colors),
      path,
      url
    }
    const result = createImage.get(payload)
    return result
  }

  function imageExists (imageId) {
    const payload = { wh_id: imageId }
    const result = checkImage.pluck().get(payload)
    return result
  }

  function addTag ({ id, name }) {
    const payload = { wh_id: id, name }
    try {
      const result = createTag.get(payload)
      return result
    } catch (error) {
      console.log({ id, name, message: error.message })
    }
  }

  function addImageTag ({ imageId, tagId }) {
    const payload = { image_id: imageId, tag_id: tagId }
    createImageTag.run(payload)
  }

  function close () {
    db.close()
  }
}
