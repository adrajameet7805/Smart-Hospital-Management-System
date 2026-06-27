# 🏥 Smart Hospital Management System — ER Diagram

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o| PATIENTS : "has profile"
    USERS ||--o| DOCTORS : "has profile"
    USERS ||--o{ NOTIFICATIONS : "receives"
    
    PATIENTS ||--o{ APPOINTMENTS : "books"
    DOCTORS ||--o{ APPOINTMENTS : "attends"
    
    PATIENTS ||--o{ PRESCRIPTIONS : "receives"
    DOCTORS ||--o{ PRESCRIPTIONS : "writes"
    APPOINTMENTS ||--o| PRESCRIPTIONS : "generates"
    
    PRESCRIPTIONS ||--o{ PRESCRIPTION_ITEMS : "contains"
    
    PATIENTS ||--o{ BILLING : "is billed"
    APPOINTMENTS ||--o| BILLING : "generates"
    BILLING ||--o{ BILLING_ITEMS : "contains"
    
    PATIENTS ||--o| BEDS : "occupies"
    
    AMBULANCES ||--o{ AMBULANCE_REQUESTS : "responds to"
    
    APPOINTMENTS ||--o| CONSULTATION_NOTES : "has"
    DOCTORS ||--o{ CONSULTATION_NOTES : "writes"
    PATIENTS ||--o{ CONSULTATION_NOTES : "receives"

    USERS {
        int id PK
        text name
        text email UK
        text password
        text role
        text phone
        int is_active
    }

    PATIENTS {
        int patient_id PK
        int user_id FK
        text blood_group
        int age
        text gender
        text address
        text allergies
        text chronic_conditions
    }

    DOCTORS {
        int doctor_id PK
        int user_id FK
        text specialization
        text department
        int experience
        text qualification
        real consultation_fee
        text availability_status
        real rating
    }

    APPOINTMENTS {
        int appointment_id PK
        int patient_id FK
        int doctor_id FK
        text date
        text time_slot
        text status
        text type
        int queue_number
        text reason
    }

    PRESCRIPTIONS {
        int prescription_id PK
        int doctor_id FK
        int patient_id FK
        int appointment_id FK
        text diagnosis
        text notes
        text follow_up_date
    }

    PRESCRIPTION_ITEMS {
        int item_id PK
        int prescription_id FK
        text medicine_name
        text dosage
        text frequency
        text duration
    }

    BEDS {
        int bed_id PK
        text bed_number UK
        text ward
        text room_number
        text bed_type
        text status
        int patient_id FK
        real daily_rate
    }

    AMBULANCES {
        int ambulance_id PK
        text vehicle_number UK
        text driver_name
        text ambulance_type
        real location_lat
        real location_lng
        text status
    }

    AMBULANCE_REQUESTS {
        int request_id PK
        text patient_name
        text patient_phone
        real pickup_lat
        real pickup_lng
        int ambulance_id FK
        text status
        text priority
    }

    BILLING {
        int bill_id PK
        int patient_id FK
        int appointment_id FK
        real subtotal
        real tax
        real discount
        real total
        text payment_status
        text invoice_number UK
    }

    BILLING_ITEMS {
        int item_id PK
        int bill_id FK
        text description
        text category
        int quantity
        real unit_price
        real amount
    }

    MEDICINES {
        int medicine_id PK
        text name
        text generic_name
        text category
        text dosage_form
        int stock
        real price
        text expiry_date
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        text title
        text message
        text type
        int read
    }

    CONSULTATION_NOTES {
        int note_id PK
        int appointment_id FK
        int doctor_id FK
        int patient_id FK
        text symptoms
        text diagnosis
        text treatment_plan
        text vital_signs
    }
```

## Table Summary

| Table | Description | Key Relationships |
|-------|-------------|-------------------|
| **users** | Central auth table for all roles | Parent of patients, doctors |
| **patients** | Patient profiles & medical info | FK to users |
| **doctors** | Doctor profiles & specializations | FK to users |
| **appointments** | Booking and scheduling | FK to patients, doctors |
| **prescriptions** | Medical prescriptions | FK to doctors, patients, appointments |
| **prescription_items** | Individual medicines in a prescription | FK to prescriptions |
| **beds** | Hospital bed tracking | FK to patients (when occupied) |
| **ambulances** | Ambulance fleet management | Referenced by requests |
| **ambulance_requests** | Emergency pickup requests | FK to ambulances |
| **billing** | Invoice and payment tracking | FK to patients, appointments |
| **billing_items** | Line items on a bill | FK to billing |
| **medicines** | Pharmacy inventory | Standalone |
| **notifications** | User alerts and messages | FK to users |
| **consultation_notes** | Detailed visit notes | FK to appointments, doctors, patients |
