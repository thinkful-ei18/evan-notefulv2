DROP TABLE IF EXISTS tags;

CREATE TABLE tags (
  id serial PRIMARY KEY,
  name text NOT NULL
);

DROP TABLE IF EXISTS notes_tags;

CREATE TABLE notes_tags (
  note_id INTEGER NOT NULL REFERENCES notes ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags ON DELETE CASCADE
);


INSERT INTO tags 
  (name) VALUES
  ('SQL'),
  ('Jquery'),
  ('Vanilla JS'),
  ('CSS');


  INSERT INTO notes_tags (
  note_id,tag_id) VALUES
  ('1079','4'),
  ('1081','2');



-- \x
-- SELECT notes.title as "Note Title", tags.name as "TagName",  notes.content, folders.name as "Foldername"
-- FROM notes
-- LEFT JOIN notes_tags
-- ON notes.id = notes_tags.note_id
-- LEFT JOIN tags
-- ON tags.id = notes_tags.tag_id
-- LEFT JOIN folders
-- ON folders.id = notes.folder_id;
