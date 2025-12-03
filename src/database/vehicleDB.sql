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

--  added multiple states
ALTER TABLE Bookings ADD CONSTRAINT CHK_BookingStatus CHECK (booking_status IN ('Pending', 'Approved', 'Active', 'Completed', 'Cancelled', 'Rejected'));


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


ALTER TABLE Vehicle ADD front_image_url VARCHAR(MAX),back_image_url VARCHAR(MAX),side_image_url VARCHAR(MAX),interior_image_url VARCHAR(MAX);



CREATE TABLE VehicleImages (image_id INT IDENTITY PRIMARY KEY,vehicle_id INT NOT NULL,image_type VARCHAR(50), image_url VARCHAR(MAX) NOT NULL,FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id));



USE VehicleRentalMngtDB;
GO



INSERT INTO Bookings (user_id, vehicle_id, booking_date, return_date, total_amount, booking_status)
VALUES
-- Pending
(3, 2, '2025-12-05 10:00:00', '2025-12-07 10:00:00', 25000, 'Pending'),

-- Approved
(3, 3, '2025-12-10 09:00:00', '2025-12-12 09:00:00', 30000, 'Approved'),

-- Active
(3, 4, '2025-11-27 08:00:00', '2025-11-29 08:00:00', 28000, 'Active'),

-- Completed
(3, 5, '2025-11-01 08:00:00', '2025-11-03 08:00:00', 30000, 'Completed'),

-- Cancelled
(3, 6, '2025-11-15 10:00:00', '2025-11-17 10:00:00', 27000, 'Cancelled'),

-- Rejected
(3, 2, '2025-12-20 10:00:00', '2025-12-22 10:00:00', 25000, 'Rejected');
GO


SELECT TOP 50 *
FROM (
    /* 1. BOOKING CREATED */
    SELECT 
        B.booking_id AS id,
        'booking_created' AS activity_type,
        CONCAT('Booking #', B.booking_id, ' created for vehicle ', B.vehicle_id) AS description,
        B.booking_date AS activity_date,
        B.booking_status AS status
    FROM Bookings B
    WHERE B.user_id = @user_id

    UNION ALL

    /* 2. BOOKING STATUS UPDATES (Approved, Active, Completed, Cancelled, Rejected) */
    SELECT 
        B.booking_id AS id,
        'booking_status' AS activity_type,
        CONCAT('Booking #', B.booking_id, ' updated to ', B.booking_status) AS description,
        B.updated_at AS activity_date,
        B.booking_status AS status
    FROM Bookings B
    WHERE B.user_id = @user_id
      AND B.updated_at IS NOT NULL

    UNION ALL

    /* 3. PAYMENTS */
    SELECT 
        P.payment_id AS id,
        CASE 
            WHEN P.payment_status = 'Completed' THEN 'payment_completed'
            WHEN P.payment_status = 'Failed' THEN 'payment_failed'
            ELSE 'payment_pending'
        END AS activity_type,
        CONCAT('Payment of ', P.amount, ' for booking #', P.booking_id) AS description,
        P.payment_date AS activity_date,
        P.payment_status AS status
    FROM Payments P
    INNER JOIN Bookings B ON P.booking_id = B.booking_id
    WHERE B.user_id = @user_id

    UNION ALL

    /* 4. UPCOMING RETURNS (Next 7 days) */
    SELECT
        B.booking_id AS id,
        'upcoming_return' AS activity_type,
        CONCAT('Vehicle ', B.vehicle_id, ' is due for return') AS description,
        B.return_date AS activity_date,
        'Due Soon' AS status
    FROM Bookings B
    WHERE B.user_id = @user_id
      AND B.booking_status = 'Active'
      AND B.return_date BETWEEN GETDATE() AND DATEADD(DAY, 7, GETDATE())

) AS UnifiedActivity
ORDER BY activity_date DESC;


ALTER TABLE Payments ALTER COLUMN transaction_id NVARCHAR(255);
