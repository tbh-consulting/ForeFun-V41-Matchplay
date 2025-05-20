/*
  # Add badge_earned to notification_type enum

  1. Changes
    - Add "badge_earned" as a valid value to the notification_type enum
    - This allows the badge achievement system to create notifications

  2. Impact
    - Enables proper notification creation when users earn badges
    - Fixes the score update error that was occurring due to invalid enum value
*/

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'badge_earned';