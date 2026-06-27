-- ============================================
-- 🏥 Smart Hospital Management System
-- PostgreSQL Migration: Initial Schema
-- ============================================

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK(role IN ('admin', 'doctor', 'patient', 'pharmacist', 'driver')),
    phone VARCHAR(20),
    avatar TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
    patient_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    blood_group VARCHAR(5) CHECK(blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    age INTEGER,
    gender VARCHAR(10) CHECK(gender IN ('male', 'female', 'other')),
    date_of_birth DATE,
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    insurance_provider VARCHAR(255),
    insurance_id VARCHAR(100),
    allergies TEXT,
    chronic_conditions TEXT,
    qr_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    experience INTEGER DEFAULT 0,
    qualification TEXT,
    license_number VARCHAR(100) UNIQUE,
    consultation_fee NUMERIC(10,2) DEFAULT 0,
    availability_status VARCHAR(20) DEFAULT 'available' CHECK(availability_status IN ('available', 'busy', 'on_leave', 'offline')),
    working_hours_start VARCHAR(10) DEFAULT '09:00',
    working_hours_end VARCHAR(10) DEFAULT '17:00',
    working_days VARCHAR(50) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    max_patients_per_day INTEGER DEFAULT 20,
    rating NUMERIC(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    end_time VARCHAR(20),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    type VARCHAR(20) DEFAULT 'general' CHECK(type IN ('general', 'follow_up', 'emergency', 'consultation', 'surgery')),
    queue_number INTEGER,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id),
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    appointment_id INTEGER REFERENCES appointments(appointment_id),
    diagnosis TEXT NOT NULL,
    notes TEXT,
    follow_up_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRESCRIPTION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prescription_items (
    item_id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT
);

-- ============================================
-- BEDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS beds (
    bed_id SERIAL PRIMARY KEY,
    bed_number VARCHAR(20) NOT NULL UNIQUE,
    ward VARCHAR(100) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    floor INTEGER DEFAULT 1,
    bed_type VARCHAR(20) DEFAULT 'general' CHECK(bed_type IN ('general', 'icu', 'private', 'semi_private', 'emergency', 'pediatric', 'maternity')),
    status VARCHAR(20) DEFAULT 'available' CHECK(status IN ('available', 'occupied', 'maintenance', 'reserved')),
    patient_id INTEGER REFERENCES patients(patient_id),
    admission_date DATE,
    expected_discharge DATE,
    daily_rate NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AMBULANCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ambulances (
    ambulance_id SERIAL PRIMARY KEY,
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    driver_name VARCHAR(255) NOT NULL,
    driver_phone VARCHAR(20),
    ambulance_type VARCHAR(20) DEFAULT 'basic' CHECK(ambulance_type IN ('basic', 'advanced', 'icu_mobile', 'neonatal')),
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    status VARCHAR(20) DEFAULT 'available' CHECK(status IN ('available', 'dispatched', 'en_route', 'at_scene', 'returning', 'maintenance')),
    current_request_id INTEGER,
    last_maintenance DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AMBULANCE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ambulance_requests (
    request_id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    pickup_lat DOUBLE PRECISION NOT NULL,
    pickup_lng DOUBLE PRECISION NOT NULL,
    pickup_address TEXT,
    destination VARCHAR(255) DEFAULT 'hospital',
    emergency_type VARCHAR(100),
    ambulance_id INTEGER REFERENCES ambulances(ambulance_id),
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'assigned', 'en_route', 'arrived', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'critical')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================
-- BILLING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS billing (
    bill_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    appointment_id INTEGER REFERENCES appointments(appointment_id),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax NUMERIC(12,2) DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK(payment_status IN ('pending', 'partial', 'paid', 'overdue', 'refunded')),
    payment_method VARCHAR(20) CHECK(payment_method IN ('cash', 'card', 'upi', 'insurance', 'online')),
    payment_date TIMESTAMPTZ,
    due_date DATE,
    invoice_number VARCHAR(50) UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BILLING ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS billing_items (
    item_id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL REFERENCES billing(bill_id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(20) CHECK(category IN ('consultation', 'procedure', 'medicine', 'lab_test', 'room', 'ambulance', 'other')),
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    amount NUMERIC(12,2) NOT NULL
);

-- ============================================
-- MEDICINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medicines (
    medicine_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(255),
    dosage_form VARCHAR(20) CHECK(dosage_form IN ('tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'powder')),
    strength VARCHAR(50),
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 10,
    price NUMERIC(10,2) NOT NULL,
    expiry_date DATE,
    requires_prescription BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'error', 'appointment', 'billing', 'emergency')),
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONSULTATION NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS consultation_notes (
    note_id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(appointment_id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id),
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    symptoms TEXT,
    examination TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    vital_signs JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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
