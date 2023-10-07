import Database from 'better-sqlite3'

const IMAGES_TABLE_CREATION_SQL = `
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY,
  image_id TEXT UNIQUE,
  colors TEXT,
  path TEXT,
  url TEXT
);`

const TAGS_TABLE_CREATION_SQL = `
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE
);`

const IMAGE_TAGS_TABLE_CREATION_SQL = `
CREATE TABLE IF NOT EXISTS images_tags (
  id INTEGER PRIMARY KEY,
  images_id INTEGER,
  tag_id INTEGER,
  FOREIGN KEY (images_id) REFERENCES images(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);
`

const CREATE_IMAGE_SQL = `
REPLACE INTO images (image_id,   colors,  path,  url)
            VALUES (@image_id, @colors, @path, @url)
RETURNING *;
`

const CREATE_TAG_SQL = `
REPLACE INTO tags (name) VALUES (@name) RETURNING *;`

const CREATE_IMAGE_TAG_SQL = `
INSERT INTO images_tags (images_id, tag_id)
                 VALUES (@images_id, @tag_id);
`

export default function LocalStorage (login) {
  const db = Database(`./localStorage/${login}.db`)
  db.exec(IMAGES_TABLE_CREATION_SQL)
  db.exec(TAGS_TABLE_CREATION_SQL)
  db.exec(IMAGE_TAGS_TABLE_CREATION_SQL)

  const createImage = db.prepare(CREATE_IMAGE_SQL)
  const createTag = db.prepare(CREATE_TAG_SQL)
  const createImageTag = db.prepare(CREATE_IMAGE_TAG_SQL)

  return { addImage, addTag, addImageTag, close }

  function addImage ({ id, colors, path, url }) {
    const payload = { image_id: id, colors, path, url }
    const result = createImage.get(payload)
    return result
  }

  function addTag ({ name }) {
    const payload = { name }
    const result = createTag.get(payload)
    return result
  }

  function addImageTag ({ imageId, tagId }) {
    const payload = { image_id: imageId, tag_id: tagId }
    createImageTag.run(payload)
  }

  function close () {
    db.close()
  }
}
