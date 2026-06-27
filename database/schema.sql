-- ⚠️ DEPRECATED: This file uses SQLite syntax and is NOT compatible with 
-- the PostgreSQL instance used in docker-compose.yml.
-- Use database/migrations/001_initial_schema.sql instead.
-- DO NOT run this file against any database.

-- ============================================
-- 🏥 Smart Hospital Management System
-- Database Schema
-- ============================================

-- Enable foreign keys (SQLite)
PRAGMA foreign_keys = ON;

-- ============================================
-- USERS TABLE
-- Central authentication table for all roles
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'doctor', 'patient', 'pharmacist', 'driver')),
    phone TEXT,
    avatar TEXT,
    is_active INTEGER DEFAULT 1,
    last_login TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
    patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    blood_group TEXT CHECK(blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    age INTEGER,
    gender TEXT CHECK(gender IN ('male', 'female', 'other')),
    date_of_birth TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    insurance_provider TEXT,
    insurance_id TEXT,
    allergies TEXT,
    chronic_conditions TEXT,
    qr_code TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- DOCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    specialization TEXT NOT NULL,
    department TEXT,
    experience INTEGER DEFAULT 0,
    qualification TEXT,
    license_number TEXT UNIQUE,
    consultation_fee REAL DEFAULT 0,
    availability_status TEXT DEFAULT 'available' CHECK(availability_status IN ('available', 'busy', 'on_leave', 'offline')),
    working_hours_start TEXT DEFAULT '09:00',
    working_hours_end TEXT DEFAULT '17:00',
    working_days TEXT DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    max_patients_per_day INTEGER DEFAULT 20,
    rating REAL DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    bio TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    end_time TEXT,
    status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    type TEXT DEFAULT 'general' CHECK(type IN ('general', 'follow_up', 'emergency', 'consultation', 'surgery')),
    queue_number INTEGER,
    reason TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
);

-- ============================================
-- PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    appointment_id INTEGER,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    follow_up_date TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);

-- ============================================
-- PRESCRIPTION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prescription_items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER NOT NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    instructions TEXT,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE
);

-- ============================================
-- BEDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS beds (
    bed_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bed_number TEXT NOT NULL UNIQUE,
    ward TEXT NOT NULL,
    room_number TEXT NOT NULL,
    floor INTEGER DEFAULT 1,
    bed_type TEXT DEFAULT 'general' CHECK(bed_type IN ('general', 'icu', 'private', 'semi_private', 'emergency', 'pediatric', 'maternity')),
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'occupied', 'maintenance', 'reserved')),
    patient_id INTEGER,
    admission_date TEXT,
    expected_discharge TEXT,
    daily_rate REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- ============================================
-- AMBULANCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ambulances (
    ambulance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_number TEXT NOT NULL UNIQUE,
    driver_name TEXT NOT NULL,
    driver_phone TEXT,
    ambulance_type TEXT DEFAULT 'basic' CHECK(ambulance_type IN ('basic', 'advanced', 'icu_mobile', 'neonatal')),
    location_lat REAL,
    location_lng REAL,
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'dispatched', 'en_route', 'at_scene', 'returning', 'maintenance')),
    current_request_id INTEGER,
    last_maintenance TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- AMBULANCE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ambulance_requests (
    request_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    pickup_lat REAL NOT NULL,
    pickup_lng REAL NOT NULL,
    pickup_address TEXT,
    destination TEXT DEFAULT 'hospital',
    emergency_type TEXT,
    ambulance_id INTEGER,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'assigned', 'en_route', 'arrived', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'critical')),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    FOREIGN KEY (ambulance_id) REFERENCES ambulances(ambulance_id)
);

-- ============================================
-- BILLING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS billing (
    bill_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    appointment_id INTEGER,
    subtotal REAL NOT NULL DEFAULT 0,
    tax REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'partial', 'paid', 'overdue', 'refunded')),
    payment_method TEXT CHECK(payment_method IN ('cash', 'card', 'upi', 'insurance', 'online')),
    payment_date TEXT,
    due_date TEXT,
    invoice_number TEXT UNIQUE,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);

-- ============================================
-- BILLING ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS billing_items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    category TEXT CHECK(category IN ('consultation', 'procedure', 'medicine', 'lab_test', 'room', 'ambulance', 'other')),
    quantity INTEGER DEFAULT 1,
    unit_price REAL NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES billing(bill_id) ON DELETE CASCADE
);

-- ============================================
-- MEDICINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medicines (
    medicine_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    generic_name TEXT,
    category TEXT NOT NULL,
    manufacturer TEXT,
    dosage_form TEXT CHECK(dosage_form IN ('tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'powder')),
    strength TEXT,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 10,
    price REAL NOT NULL,
    expiry_date TEXT,
    requires_prescription INTEGER DEFAULT 1,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'error', 'appointment', 'billing', 'emergency')),
    read INTEGER DEFAULT 0,
    action_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- CONSULTATION NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS consultation_notes (
    note_id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    symptoms TEXT,
    examination TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    vital_signs TEXT, -- JSON: {"bp": "120/80", "temp": "98.6", "pulse": "72", "spo2": "98"}
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_billing_patient ON billing(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing(payment_status);
CREATE INDEX IF NOT EXISTS idx_beds_status ON beds(status);
CREATE INDEX IF NOT EXISTS idx_ambulances_status ON ambulances(status);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
