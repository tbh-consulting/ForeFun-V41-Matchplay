/*
  # Insert Waregem Golf Club

  1. Course Details
    - Name: Waregem Golf Club
    - Address: Bergstraat 41, 8790 Waregem, Belgium
    - 18 holes
    - Dogs not allowed
    - Created by specific user

  2. Hole Details
    - Complete hole data for all 18 holes
    - Distances in meters for all tee colors
    - Par and S.I. (handicap) information
*/

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
  'Waregem Golf Club',
  'Bergstraat 41, 8790 Waregem',
  'BE',
  18,
  'no',
  '498a5a58-b4cb-462f-9540-16d94085b6bc',
  NOW(),
  NOW()
);

-- Insert hole data
WITH course_id AS (SELECT id FROM courses WHERE name = 'Waregem Golf Club' LIMIT 1)
INSERT INTO course_holes (
  course_id,
  hole_number,
  par,
  handicap,
  distance_white_meters,
  distance_yellow_meters,
  distance_blue_meters,
  distance_red_meters
) VALUES
  -- Front 9
  ((SELECT id FROM course_id), 1, 4, 10, 309, 299, 287, 276),
  ((SELECT id FROM course_id), 2, 3, 16, 185, 164, 147, 132),
  ((SELECT id FROM course_id), 3, 5, 4, 483, 437, 400, 387),
  ((SELECT id FROM course_id), 4, 4, 2, 388, 369, 334, 318),
  ((SELECT id FROM course_id), 5, 4, 18, 281, 281, 246, 226),
  ((SELECT id FROM course_id), 6, 4, 8, 339, 321, 279, 272),
  ((SELECT id FROM course_id), 7, 4, 6, 339, 326, 295, 279),
  ((SELECT id FROM course_id), 8, 4, 14, 347, 321, 266, 257),
  ((SELECT id FROM course_id), 9, 5, 12, 447, 431, 397, 356),
  -- Back 9
  ((SELECT id FROM course_id), 10, 5, 9, 459, 459, 444, 404),
  ((SELECT id FROM course_id), 11, 3, 13, 172, 163, 151, 140),
  ((SELECT id FROM course_id), 12, 4, 17, 246, 246, 214, 214),
  ((SELECT id FROM course_id), 13, 4, 1, 391, 364, 338, 324),
  ((SELECT id FROM course_id), 14, 4, 5, 376, 355, 324, 315),
  ((SELECT id FROM course_id), 15, 4, 3, 330, 267, 244, 227),
  ((SELECT id FROM course_id), 16, 3, 11, 158, 141, 122, 89),
  ((SELECT id FROM course_id), 17, 4, 7, 351, 313, 282, 273),
  ((SELECT id FROM course_id), 18, 4, 15, 310, 250, 250, 234);