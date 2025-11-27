-- . Users Table:

-- o Fields: user_id (PK), first_name,last_name email (UNIQUE), password contact_phone, address, role (ENUM: 'user', 'admin' DEFAULT 'user'), created_at, updated_at.
CREATE DATABASE VehicleRentalMngtDB;

USE VehicleRentalMngtDB;

CREATE TABLE Users(
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    first_name VARCHAR(200) NOT NULL,
    last_name VARCHAR(200) NOT NULL, 
    email VARCHAR(255) UNIQUE NOT NULL, 
    password VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20), 
    address VARCHAR(255), 
    role VARCHAR(20) NULL DEFAULT 'user', 
    created_at DATETIME DEFAULT GETDATE(), 
    updated_at DATETIME,
    CONSTRAINT chk_user_role CHECK (role IN ('user', 'admin')) 
);

-- 3. Vehicle Specification Table:

-- o Fields: vehicleSpec_id (PK), manufacturer, model, year, fuel_type, engine_capacity, transmission, seating_capacity, color, features.

CREATE TABLE VehicleSpecs(
    vehicle_spec_id INT IDENTITY(1,1) PRIMARY KEY, 
    manufacturer VARCHAR(255) NOT NULL, 
    model VARCHAR(255) NOT NULL, 
    year SMALLINT, 
    fuel_type VARCHAR(255), 
    engine_capacity VARCHAR(255), 
    transmission VARCHAR(255), 
    seating_capacity INT, 
    color VARCHAR(255), 
    features VARCHAR(MAX)
)

-- 2. Vehicles Table:

-- o Fields: vehicle_spec_id(FK), vehicle_id (PK), rental_rate, availability, created_at, updated_at.

CREATE TABLE Vehicle(
    vehicle_spec_id INT NOT NULL, 
    vehicle_id INT IDENTITY(1,1) PRIMARY KEY , 
    rental_rate DECIMAL(10,2) NOT NULL, 
    availability BIT DEFAULT 1, 
    created_at DATETIME DEFAULT GETDATE(), 
    updated_at DATETIME,
    FOREIGN KEY (vehicle_spec_id) REFERENCES VehicleSpecs(vehicle_spec_id)
);



-- 4. Bookings Table:

-- o Fields: booking_id (PK), user_id (FK), vehicle_id (FK), location_id (FK), booking_date, return_date, total_amount, booking_status (DEFAULT 'Pending'), created_at, updated_at.
CREATE TABLE Bookings(
    booking_id INT IDENTITY(1,1) PRIMARY KEY, 
    user_id INT NOT NULL, 
    vehicle_id INT NOT NULL, 
    booking_date DATETIME, 
    return_date DATETIME, 
    total_amount  DECIMAL(10,2), 
    booking_status VARCHAR(50) DEFAULT 'Pending', 
    created_at DATETIME DEFAULT GETDATE(), 
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
      ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id)
      ON DELETE CASCADE
);


-- 5. Payments Table:

-- o Fields: payment_id (PK), booking_id (FK), amount, payment_status (DEFAULT 'Pending'), payment_date, payment_method, transaction_id, created_at, updated_at.
CREATE TABLE Payments(
    payment_id INT IDENTITY(1,1) PRIMARY KEY, 
    booking_id INT NOT NULL, 
    amount DECIMAL(10,2), 
    payment_status VARCHAR(25) DEFAULT 'Pending', 
    payment_date DATETIME, 
    payment_method VARCHAR(255) NOT NULL, 
    transaction_id INT NOT NULL, 
    created_at DATETIME DEFAULT GETDATE(), 
    updated_at DATETIME,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
      ON DELETE CASCADE
);

-- 6. Customer Support Tickets Table:

-- · Fields: ticket_id (PK), user_id (FK), subject, description, status, created_at, updated_at.

CREATE TABLE Tickets(
     ticket_id INT IDENTITY(1,1) PRIMARY KEY, 
     user_id INT NOT NULL, 
     subject VARCHAR(255), 
     description VARCHAR(MAX), 
     status BIT DEFAULT 1, 
     created_at DATETIME DEFAULT GETDATE(), 
     updated_at DATETIME,
     FOREIGN KEY (user_id) REFERENCES Users(user_id)
      ON DELETE CASCADE
);


--7. create OTP table
CREATE TABLE OTPs (
  id INT IDENTITY(1,1) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at DATETIME NOT NULL
);
