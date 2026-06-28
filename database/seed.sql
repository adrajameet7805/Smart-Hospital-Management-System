-- ============================================
-- 🏥 Smart Hospital Management System
-- Seed Data
-- ============================================

-- ============================================
-- ADMIN USER (password: admin123)
-- ============================================
INSERT INTO users (name, email, password, role, phone) VALUES
('Admin User', 'admin@smarthospital.com', '$2a$10$DKbhyFv/O1HI2SQBUbLYZeTFHCrs7jBiE.V4zgotLoAP5kzP/jiTm', 'admin', '+91-9000000001');

-- ============================================
-- DOCTORS (password: doctor123)
-- ============================================
INSERT INTO users (name, email, password, role, phone) VALUES
('Dr. Aisha Patel', 'aisha.patel@smarthospital.com', '$2a$10$LAMgTMBzd6KubYeAkAjhLe.7OuqcR0R7sZdcEjEjBiuchAVaSJqXy', 'doctor', '+91-9000000002'),
('Dr. Rajesh Kumar', 'rajesh.kumar@smarthospital.com', '$2a$10$LAMgTMBzd6KubYeAkAjhLe.7OuqcR0R7sZdcEjEjBiuchAVaSJqXy', 'doctor', '+91-9000000003'),
('Dr. Priya Sharma', 'priya.sharma@smarthospital.com', '$2a$10$LAMgTMBzd6KubYeAkAjhLe.7OuqcR0R7sZdcEjEjBiuchAVaSJqXy', 'doctor', '+91-9000000004'),
('Dr. Vikram Singh', 'vikram.singh@smarthospital.com', '$2a$10$LAMgTMBzd6KubYeAkAjhLe.7OuqcR0R7sZdcEjEjBiuchAVaSJqXy', 'doctor', '+91-9000000005'),
('Dr. Neha Gupta', 'neha.gupta@smarthospital.com', '$2a$10$LAMgTMBzd6KubYeAkAjhLe.7OuqcR0R7sZdcEjEjBiuchAVaSJqXy', 'doctor', '+91-9000000006');

INSERT INTO doctors (user_id, specialization, department, experience, qualification, license_number, consultation_fee, bio, rating, total_reviews) VALUES
(2, 'Cardiologist', 'Cardiology', 12, 'MD, DM Cardiology', 'MH-2014-08821', 1500, 'Specialist in interventional cardiology with 12 years of experience in complex cardiac procedures.', 4.8, 234),
(3, 'Orthopedic Surgeon', 'Orthopedics', 18, 'MS Orthopedics, Fellowship Joint Replacement', 'MH-2006-05512', 1200, 'Expert in joint replacement surgery and sports medicine with international training.', 4.6, 189),
(4, 'Pediatrician', 'Pediatrics', 8, 'MD Pediatrics', 'MH-2016-11234', 800, 'Compassionate pediatric care specialist focusing on child development and preventive care.', 4.9, 312),
(5, 'Neurologist', 'Neurology', 15, 'DM Neurology', 'MH-2009-07789', 2000, 'Renowned neurologist specializing in stroke management and neurodegenerative disorders.', 4.7, 156),
(6, 'Dermatologist', 'Dermatology', 6, 'MD Dermatology', 'MH-2018-14567', 1000, 'Dermatology specialist with expertise in cosmetic procedures and skin disorders.', 4.5, 278);

-- ============================================
-- PATIENTS (password: patient123)
-- ============================================
INSERT INTO users (name, email, password, role, phone) VALUES
('Arjun Mehta', 'arjun.mehta@email.com', '$2a$10$9DaHC2MqgQ9crrVk4Xt7nuf79byqG.vWXU39uiXyLm9kxdQNZjT/m', 'patient', '+91-9100000001'),
('Sneha Reddy', 'sneha.reddy@email.com', '$2a$10$9DaHC2MqgQ9crrVk4Xt7nuf79byqG.vWXU39uiXyLm9kxdQNZjT/m', 'patient', '+91-9100000002'),
('Karan Joshi', 'karan.joshi@email.com', '$2a$10$9DaHC2MqgQ9crrVk4Xt7nuf79byqG.vWXU39uiXyLm9kxdQNZjT/m', 'patient', '+91-9100000003'),
('Meera Nair', 'meera.nair@email.com', '$2a$10$9DaHC2MqgQ9crrVk4Xt7nuf79byqG.vWXU39uiXyLm9kxdQNZjT/m', 'patient', '+91-9100000004'),
('Ravi Desai', 'ravi.desai@email.com', '$2a$10$9DaHC2MqgQ9crrVk4Xt7nuf79byqG.vWXU39uiXyLm9kxdQNZjT/m', 'patient', '+91-9100000005'),
('Ananya Iyer', 'ananya.iyer@email.com', '$2a$10$9DaHC2MqgQ9crrVk4Xt7nuf79byqG.vWXU39uiXyLm9kxdQNZjT/m', 'patient', '+91-9100000006'),
('Deepak Verma', 'deepak.verma@email.com', '$2a$10$9DaHC2MqgQ9crrVk4Xt7nuf79byqG.vWXU39uiXyLm9kxdQNZjT/m', 'patient', '+91-9100000007'),
('Pooja Malhotra', 'pooja.malhotra@email.com', '$2a$10$9DaHC2MqgQ9crrVk4Xt7nuf79byqG.vWXU39uiXyLm9kxdQNZjT/m', 'patient', '+91-9100000008'),
('Amit Saxena', 'amit.saxena@email.com', '$2a$10$9DaHC2MqgQ9crrVk4Xt7nuf79byqG.vWXU39uiXyLm9kxdQNZjT/m', 'patient', '+91-9100000009'),
('Divya Kapoor', 'divya.kapoor@email.com', '$2a$10$9DaHC2MqgQ9crrVk4Xt7nuf79byqG.vWXU39uiXyLm9kxdQNZjT/m', 'patient', '+91-9100000010');

INSERT INTO patients (user_id, blood_group, age, gender, date_of_birth, address, emergency_contact_name, emergency_contact_phone, allergies, chronic_conditions) VALUES
(7,  'A+',  32, 'male',   '1994-03-15', '42 MG Road, Mumbai',        'Sonia Mehta',    '+91-9200000001', 'Penicillin',    NULL),
(8,  'B+',  28, 'female', '1998-07-22', '18 Jubilee Hills, Hyderabad','Rahul Reddy',    '+91-9200000002', NULL,            NULL),
(9,  'O+',  45, 'male',   '1981-11-08', '56 Baner Road, Pune',       'Meena Joshi',    '+91-9200000003', NULL,            'Diabetes Type 2'),
(10, 'AB-', 35, 'female', '1991-01-30', '12 Marine Drive, Kochi',    'Suresh Nair',    '+91-9200000004', 'Sulfa drugs',   'Hypertension'),
(11, 'O-',  52, 'male',   '1974-06-18', '78 CG Road, Ahmedabad',    'Priya Desai',    '+91-9200000005', NULL,            'Asthma'),
(12, 'A-',  24, 'female', '2002-09-05', '34 Koramangala, Bangalore', 'Venkat Iyer',    '+91-9200000006', 'Latex',         NULL),
(13, 'B-',  41, 'male',   '1985-04-12', '90 Connaught Place, Delhi', 'Sunita Verma',   '+91-9200000007', NULL,            'Thyroid disorder'),
(14, 'AB+', 29, 'female', '1997-12-25', '67 Park Street, Kolkata',   'Rajesh Malhotra', '+91-9200000008', 'Aspirin',       NULL),
(15, 'A+',  38, 'male',   '1988-08-14', '23 Civil Lines, Jaipur',   'Kavita Saxena',  '+91-9200000009', NULL,            'High cholesterol'),
(16, 'O+',  31, 'female', '1995-05-20', '45 Sector 17, Chandigarh', 'Mohan Kapoor',   '+91-9200000010', NULL,            NULL);

-- ============================================
-- APPOINTMENTS
-- ============================================
INSERT INTO appointments (patient_id, doctor_id, date, time_slot, end_time, status, type, queue_number, reason) VALUES
(1,  1, '2026-06-26', '09:00', '09:30', 'scheduled',  'general',      1,  'Chest pain and shortness of breath'),
(2,  3, '2026-06-26', '09:30', '10:00', 'scheduled',  'general',      2,  'Child fever and cough'),
(3,  2, '2026-06-26', '10:00', '10:30', 'confirmed',  'follow_up',    3,  'Post knee replacement follow-up'),
(4,  4, '2026-06-26', '10:30', '11:00', 'confirmed',  'consultation', 4,  'Recurring headaches and dizziness'),
(5,  1, '2026-06-26', '11:00', '11:30', 'scheduled',  'general',      5,  'Heart palpitations'),
(6,  5, '2026-06-26', '11:30', '12:00', 'scheduled',  'general',      6,  'Skin rash on arms'),
(7,  3, '2026-06-26', '14:00', '14:30', 'scheduled',  'general',      7,  'Child vaccination'),
(8,  2, '2026-06-26', '14:30', '15:00', 'confirmed',  'emergency',    8,  'Severe back pain'),
(1,  4, '2026-06-25', '09:00', '09:30', 'completed',  'general',      1,  'Migraine evaluation'),
(3,  1, '2026-06-24', '10:00', '10:30', 'completed',  'follow_up',    3,  'Blood pressure check'),
(5,  1, '2026-06-23', '11:00', '11:30', 'completed',  'general',      2,  'Annual checkup'),
(2,  5, '2026-06-22', '09:30', '10:00', 'completed',  'consultation', 1,  'Acne treatment follow-up'),
(9,  4, '2026-06-27', '09:00', '09:30', 'scheduled',  'general',      1,  'Memory issues'),
(10, 1, '2026-06-27', '10:00', '10:30', 'scheduled',  'follow_up',    2,  'Post-surgery cardiac check');

-- ============================================
-- PRESCRIPTIONS
-- ============================================
INSERT INTO prescriptions (doctor_id, patient_id, appointment_id, diagnosis, notes, follow_up_date, status) VALUES
(1, 1, 9,  'Mild migraine', 'Avoid stress and screen time. Regular sleep schedule recommended.', '2026-07-10', 'active'),
(1, 3, 10, 'Controlled hypertension', 'Blood pressure stable at 130/85. Continue current medication.', '2026-07-24', 'active'),
(1, 5, 11, 'Normal cardiac function', 'All vitals normal. ECG within range. Annual follow-up.', '2027-06-23', 'completed'),
(5, 2, 12, 'Acne vulgaris - improving', 'Skin showing improvement. Continue treatment for 2 more months.', '2026-08-22', 'active');

INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions) VALUES
(1, 'Sumatriptan 50mg',   '50mg',  'As needed',        '30 days', 'Take at onset of migraine. Max 2 tablets per day.'),
(1, 'Paracetamol 500mg',  '500mg', 'Twice daily',      '7 days',  'Take after meals.'),
(2, 'Amlodipine 5mg',     '5mg',   'Once daily',       '30 days', 'Take in the morning.'),
(2, 'Losartan 50mg',      '50mg',  'Once daily',       '30 days', 'Take before bedtime.'),
(3, 'Aspirin 75mg',       '75mg',  'Once daily',       '365 days','Take after breakfast. Do not skip.'),
(4, 'Adapalene Gel 0.1%', 'Apply', 'Once daily (night)','60 days', 'Apply thin layer on affected area. Use sunscreen during day.');

-- ============================================
-- BEDS
-- ============================================
INSERT INTO beds (bed_number, ward, room_number, floor, bed_type, status, patient_id, admission_date, daily_rate) VALUES
('GEN-101', 'General',     '101', 1, 'general',      'occupied',    3,    '2026-06-20', 1500),
('GEN-102', 'General',     '101', 1, 'general',      'available',   NULL, NULL,          1500),
('GEN-103', 'General',     '102', 1, 'general',      'available',   NULL, NULL,          1500),
('GEN-201', 'General',     '201', 2, 'general',      'occupied',    5,    '2026-06-24', 1500),
('PVT-301', 'Private',     '301', 3, 'private',      'available',   NULL, NULL,          5000),
('PVT-302', 'Private',     '302', 3, 'private',      'occupied',    4,    '2026-06-22', 5000),
('PVT-303', 'Private',     '303', 3, 'private',      'maintenance', NULL, NULL,          5000),
('ICU-401', 'ICU',         '401', 4, 'icu',          'available',   NULL, NULL,          10000),
('ICU-402', 'ICU',         '402', 4, 'icu',          'occupied',    9,    '2026-06-25', 10000),
('ICU-403', 'ICU',         '403', 4, 'icu',          'available',   NULL, NULL,          10000),
('EMR-501', 'Emergency',   '501', 1, 'emergency',    'available',   NULL, NULL,          3000),
('EMR-502', 'Emergency',   '502', 1, 'emergency',    'available',   NULL, NULL,          3000),
('PED-601', 'Pediatrics',  '601', 2, 'pediatric',    'available',   NULL, NULL,          2000),
('PED-602', 'Pediatrics',  '602', 2, 'pediatric',    'occupied',    7,    '2026-06-25', 2000),
('MAT-701', 'Maternity',   '701', 3, 'maternity',    'available',   NULL, NULL,          3500),
('SPR-801', 'Semi-Private', '801', 2, 'semi_private', 'available',   NULL, NULL,          2500);

-- ============================================
-- AMBULANCES
-- ============================================
INSERT INTO ambulances (vehicle_number, driver_name, driver_phone, ambulance_type, location_lat, location_lng, status) VALUES
('MH-01-AB-1234', 'Ramesh Yadav',   '+91-9300000001', 'advanced',   19.0760, 72.8777, 'available'),
('MH-01-CD-5678', 'Sunil Patil',    '+91-9300000002', 'basic',      19.0830, 72.8900, 'dispatched'),
('MH-01-EF-9012', 'Ganesh More',    '+91-9300000003', 'icu_mobile', 19.0600, 72.8500, 'available'),
('MH-01-GH-3456', 'Prakash Shinde', '+91-9300000004', 'basic',      19.0900, 72.8700, 'en_route'),
('MH-01-IJ-7890', 'Manoj Pawar',   '+91-9300000005', 'neonatal',   19.0700, 72.8600, 'available');

-- ============================================
-- BILLING
-- ============================================
INSERT INTO billing (patient_id, appointment_id, subtotal, tax, discount, total, payment_status, payment_method, payment_date, invoice_number) VALUES
(1, 9,  1500,  270,  0,    1770,  'paid',    'upi',       '2026-06-25', 'INV-2026-0001'),
(3, 10, 1500,  270,  150,  1620,  'paid',    'card',      '2026-06-24', 'INV-2026-0002'),
(5, 11, 1500,  270,  0,    1770,  'paid',    'cash',      '2026-06-23', 'INV-2026-0003'),
(2, 12, 1000,  180,  100,  1080,  'paid',    'insurance', '2026-06-22', 'INV-2026-0004'),
(3, 3,  13200, 2376, 1000, 14576, 'partial', 'card',      NULL,         'INV-2026-0005'),
(4, 4,  2000,  360,  0,    2360,  'pending', NULL,        NULL,         'INV-2026-0006');

INSERT INTO billing_items (bill_id, description, category, quantity, unit_price, amount) VALUES
(1, 'Consultation - Cardiology',     'consultation', 1, 1500,  1500),
(2, 'Consultation - Cardiology',     'consultation', 1, 1500,  1500),
(3, 'Consultation - Cardiology',     'consultation', 1, 1500,  1500),
(4, 'Consultation - Dermatology',    'consultation', 1, 1000,  1000),
(5, 'Consultation - Orthopedics',    'consultation', 1, 1200,  1200),
(5, 'Room - General Ward (8 days)',  'room',         8, 1500,  12000),
(6, 'Consultation - Neurology',      'consultation', 1, 2000,  2000);

-- ============================================
-- MEDICINES
-- ============================================
INSERT INTO medicines (name, generic_name, category, manufacturer, dosage_form, strength, stock, min_stock, price, expiry_date) VALUES
('Paracetamol',     'Acetaminophen',    'Analgesic',        'Cipla',          'tablet',    '500mg',  500, 50,  12.00,  '2027-12-31'),
('Amoxicillin',     'Amoxicillin',      'Antibiotic',       'Sun Pharma',     'capsule',   '500mg',  300, 30,  45.00,  '2027-06-30'),
('Amlodipine',      'Amlodipine',       'Antihypertensive', 'Lupin',          'tablet',    '5mg',    200, 20,  35.00,  '2028-03-31'),
('Metformin',       'Metformin HCl',    'Antidiabetic',     'USV',            'tablet',    '500mg',  400, 40,  28.00,  '2027-09-30'),
('Omeprazole',      'Omeprazole',       'Antacid',          'Dr Reddy''s',    'capsule',   '20mg',   350, 30,  18.00,  '2027-11-30'),
('Cetirizine',      'Cetirizine HCl',   'Antihistamine',    'Cipla',          'tablet',    '10mg',   250, 25,  8.00,   '2028-01-31'),
('Azithromycin',    'Azithromycin',     'Antibiotic',       'Alkem',          'tablet',    '500mg',  150, 15,  85.00,  '2027-08-31'),
('Sumatriptan',     'Sumatriptan',      'Antimigraine',     'Sun Pharma',     'tablet',    '50mg',   100, 10,  120.00, '2027-10-31'),
('Losartan',        'Losartan Potassium','Antihypertensive','Torrent',        'tablet',    '50mg',   180, 20,  42.00,  '2028-02-28'),
('Aspirin',         'Acetylsalicylic Acid','Antiplatelet',  'Bayer',          'tablet',    '75mg',   600, 50,  15.00,  '2028-06-30'),
('Insulin Glargine','Insulin Glargine', 'Antidiabetic',     'Sanofi',         'injection', '100IU/ml',50, 10, 950.00, '2027-04-30'),
('Salbutamol',      'Albuterol',        'Bronchodilator',   'Cipla',          'inhaler',   '100mcg', 80,  10,  180.00, '2027-12-31'),
('Adapalene Gel',   'Adapalene',        'Dermatological',   'Galderma',       'cream',     '0.1%',   60,  10,  350.00, '2028-05-31'),
('Vitamin D3',      'Cholecalciferol',  'Supplement',       'Abbott',         'tablet',    '60000IU',200, 20,  120.00, '2028-08-31'),
('Cough Syrup',     'Dextromethorphan', 'Antitussive',      'Mankind',        'syrup',     '15mg/5ml',120,15, 95.00,  '2027-07-31');

-- ============================================
-- NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, title, message, type, read) VALUES
(7,  'Appointment Confirmed',    'Your appointment with Dr. Aisha Patel on June 26 at 9:00 AM is confirmed.', 'appointment', 0),
(7,  'Prescription Ready',       'Your prescription from Dr. Vikram Singh is ready for pickup at the pharmacy.', 'info', 0),
(8,  'Appointment Reminder',     'Reminder: You have an appointment with Dr. Priya Sharma tomorrow at 9:30 AM.', 'appointment', 1),
(9,  'Bill Generated',           'A new bill (INV-2026-0005) of ₹14,576 has been generated for your treatment.', 'billing', 0),
(2,  'New Patient Assigned',     'Patient Arjun Mehta has been assigned to you for consultation today.', 'info', 0),
(1,  'Emergency Alert',          'Ambulance MH-01-GH-3456 dispatched for emergency pickup.', 'emergency', 0),
(1,  'Low Stock Alert',          'Insulin Glargine stock is running low (50 units remaining).', 'warning', 0),
(11, 'Appointment Scheduled',    'Your appointment with Dr. Aisha Patel on June 26 at 11:00 AM has been scheduled.', 'appointment', 0);
