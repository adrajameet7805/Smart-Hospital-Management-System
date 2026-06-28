-- Align demo account passwords with the credentials shown in the UI.
UPDATE users
SET password = '$2a$10$DKbhyFv/O1HI2SQBUbLYZeTFHCrs7jBiE.V4zgotLoAP5kzP/jiTm'
WHERE email = 'admin@smarthospital.com';

UPDATE users
SET password = '$2a$10$LAMgTMBzd6KubYeAkAjhLe.7OuqcR0R7sZdcEjEjBiuchAVaSJqXy'
WHERE email IN (
  'aisha.patel@smarthospital.com',
  'rajesh.kumar@smarthospital.com',
  'priya.sharma@smarthospital.com',
  'vikram.singh@smarthospital.com',
  'neha.gupta@smarthospital.com'
);

UPDATE users
SET password = '$2a$10$9DaHC2MqgQ9crrVk4Xt7nuf79byqG.vWXU39uiXyLm9kxdQNZjT/m'
WHERE email IN (
  'arjun.mehta@email.com',
  'sneha.reddy@email.com',
  'karan.joshi@email.com',
  'meera.nair@email.com',
  'ravi.desai@email.com',
  'ananya.iyer@email.com',
  'deepak.verma@email.com',
  'pooja.malhotra@email.com',
  'amit.saxena@email.com',
  'divya.kapoor@email.com'
);
