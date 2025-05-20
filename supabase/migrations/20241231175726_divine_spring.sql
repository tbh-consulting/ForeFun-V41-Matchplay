/*
  # Add Damme Golf & Country Club Championship Course

  1. Course Details
    - Name: Damme Golf & Country Club Championship Course
    - Address: Doornstraat 16, 8340 Damme, Belgium
    - 18 holes
    - Dogs allowed
    - Created by: 498a5a58-b4cb-462f-9540-16d94085b6bc

  2. Hole Details
    - All 18 holes with their respective:
      - Par values
      - Handicap indices (SI)
      - Distances for all tee colors (black, white, yellow, blue, red) in meters
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
  'Damme Golf & Country Club Championship Course',
  'Doornstraat 16, 8340 Damme',
  'BE',
  18,
  'yes',
  '498a5a58-b4cb-462f-9540-16d94085b6bc',
  NOW(),
  NOW()
);

-- Insert hole data
WITH course_id AS (SELECT id FROM courses WHERE name = 'Damme Golf & Country Club Championship Course' LIMIT 1)
INSERT INTO course_holes (
  course_id,
  hole_number,
  par,
  handicap,
  distance_black_meters,
  distance_white_meters,
  distance_yellow_meters,
  distance_blue_meters,
  distance_red_meters
) VALUES
  -- Front 9
  ((SELECT id FROM course_id), 1, 4, 9, 343, 321, 312, 299, 267),
  ((SELECT id FROM course_id), 2, 4, 3, 387, 385, 375, 334, 325),
  ((SELECT id FROM course_id), 3, 5, 5, 490, 483, 465, 436, 428),
  ((SELECT id FROM course_id), 4, 4, 13, 292, 292, 284, 250, 246),
  ((SELECT id FROM course_id), 5, 3, 17, 135, 135, 129, 125, 82),
  ((SELECT id FROM course_id), 6, 4, 11, 303, 303, 293, 281, 270),
  ((SELECT id FROM course_id), 7, 4, 7, 375, 375, 350, 336, 292),
  ((SELECT id FROM course_id), 8, 3, 15, 185, 167, 155, 139, 112),
  ((SELECT id FROM course_id), 9, 4, 1, 439, 426, 379, 363, 315),
  -- Back 9
  ((SELECT id FROM course_id), 10, 4, 18, 295, 295, 277, 245, 235),
  ((SELECT id FROM course_id), 11, 4, 4, 386, 386, 376, 308, 300),
  ((SELECT id FROM course_id), 12, 5, 6, 474, 474, 449, 436, 400),
  ((SELECT id FROM course_id), 13, 3, 14, 220, 202, 193, 184, 175),
  ((SELECT id FROM course_id), 14, 4, 2, 373, 373, 365, 300, 300),
  ((SELECT id FROM course_id), 15, 4, 16, 315, 315, 300, 291, 278),
  ((SELECT id FROM course_id), 16, 5, 10, 479, 479, 475, 418, 409),
  ((SELECT id FROM course_id), 17, 3, 12, 221, 182, 170, 164, 148),
  ((SELECT id FROM course_id), 18, 5, 8, 511, 479, 467, 447, 410);