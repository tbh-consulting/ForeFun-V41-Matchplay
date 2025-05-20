-- Insert course
INSERT INTO courses (
  name,
  address,
  country,
  holes,
  dog_policy,
  created_by,
  created_at,
  updated_at
) VALUES (
  'Abama Golf Course',
  'María Zambrano 3. 38687 Guia de Isora, Tenerife, Spain',
  'ES',
  18,
  'no',
  '498a5a58-b4cb-462f-9540-16d94085b6bc',
  NOW(),
  NOW()
);

-- Insert hole data
WITH course_id AS (SELECT id FROM courses WHERE name = 'Abama Golf Course' LIMIT 1)
INSERT INTO course_holes (
  course_id,
  hole_number,
  par,
  handicap,
  distance_black_meters,
  distance_yellow_meters,
  distance_blue_meters,
  distance_red_meters
) VALUES
  -- Front 9
  ((SELECT id FROM course_id), 1, 4, 9, 319, 293, 276, 256),
  ((SELECT id FROM course_id), 2, 4, 7, 365, 265, 262, 238),
  ((SELECT id FROM course_id), 3, 5, 11, 525, 502, 477, 451),
  ((SELECT id FROM course_id), 4, 3, 5, 210, 182, 173, 142),
  ((SELECT id FROM course_id), 5, 4, 13, 307, 300, 291, 284),
  ((SELECT id FROM course_id), 6, 5, 15, 443, 423, 395, 370),
  ((SELECT id FROM course_id), 7, 3, 17, 141, 130, 120, 108),
  ((SELECT id FROM course_id), 8, 4, 1, 413, 387, 351, 326),
  ((SELECT id FROM course_id), 9, 4, 3, 413, 390, 356, 323),
  -- Back 9
  ((SELECT id FROM course_id), 10, 5, 12, 483, 463, 444, 422),
  ((SELECT id FROM course_id), 11, 4, 10, 343, 324, 305, 286),
  ((SELECT id FROM course_id), 12, 3, 14, 180, 152, 135, 103),
  ((SELECT id FROM course_id), 13, 4, 16, 279, 276, 258, 234),
  ((SELECT id FROM course_id), 14, 3, 18, 193, 147, 127, 124),
  ((SELECT id FROM course_id), 15, 4, 4, 378, 349, 316, 287),
  ((SELECT id FROM course_id), 16, 4, 6, 384, 349, 327, 298),
  ((SELECT id FROM course_id), 17, 5, 8, 502, 452, 426, 363),
  ((SELECT id FROM course_id), 18, 4, 2, 403, 385, 369, 334);