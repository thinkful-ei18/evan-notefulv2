-- Notes table has name, title, id. 

DROP TABLE IF EXISTS notes;

CREATE TABLE notes(
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  created timestamp DEFAULT now()
);

ALTER SEQUENCE notes_id_seq RESTART WITH 1000;


INSERT INTO notes 
  (title,content) VALUES
  ('Cats are Cool','Dogs do Drool'),
  ('Cats are fat','Dogs do not Drool'),
  ('Cats are fuzzy','Dogs Drool on sundays'),
  ('Cats are cute','Dogs Drool tomorrow'),
  ('Cats are sometimes Fat','Dogs Drool yesterday'),
  ('Cats are Sometimes Orange','Dogs Drool 5') RETURNING id;