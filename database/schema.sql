-- GaadiLife database schema (generated from the SQLAlchemy models)

CREATE TABLE brands (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	name VARCHAR(100) NOT NULL, 
	logo_url VARCHAR(255), 
	PRIMARY KEY (id)
);

CREATE TABLE cities (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	name VARCHAR(100) NOT NULL, 
	province VARCHAR(100), 
	PRIMARY KEY (id)
);

CREATE TABLE car_models (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	brand_id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(brand_id) REFERENCES brands (id)
);

CREATE TABLE users (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	name VARCHAR(100) NOT NULL, 
	email VARCHAR(150) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	phone VARCHAR(20), 
	`role` ENUM('buyer','seller','admin'), 
	city_id INTEGER, 
	created_at TIMESTAMP NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	UNIQUE (email), 
	FOREIGN KEY(city_id) REFERENCES cities (id)
);

CREATE TABLE cars (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	seller_id INTEGER NOT NULL, 
	brand_id INTEGER NOT NULL, 
	model_id INTEGER NOT NULL, 
	city_id INTEGER NOT NULL, 
	title VARCHAR(200) NOT NULL, 
	description TEXT, 
	price DECIMAL(12, 2) NOT NULL, 
	year INTEGER NOT NULL, 
	mileage INTEGER, 
	fuel_type ENUM('petrol','diesel','hybrid','electric'), 
	transmission ENUM('manual','automatic'), 
	condition_type ENUM('new','used'), 
	color VARCHAR(50), 
	registration_city VARCHAR(100), 
	status ENUM('pending','approved','sold','rejected'), 
	created_at TIMESTAMP NULL DEFAULT (now()), 
	updated_at TIMESTAMP NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	FOREIGN KEY(seller_id) REFERENCES users (id), 
	FOREIGN KEY(brand_id) REFERENCES brands (id), 
	FOREIGN KEY(model_id) REFERENCES car_models (id), 
	FOREIGN KEY(city_id) REFERENCES cities (id)
);

CREATE TABLE car_images (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	car_id INTEGER NOT NULL, 
	image_url VARCHAR(255) NOT NULL, 
	is_primary BOOL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(car_id) REFERENCES cars (id)
);

CREATE TABLE favorites (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER NOT NULL, 
	car_id INTEGER NOT NULL, 
	created_at TIMESTAMP NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(car_id) REFERENCES cars (id)
);

CREATE TABLE messages (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	sender_id INTEGER NOT NULL, 
	receiver_id INTEGER NOT NULL, 
	car_id INTEGER NOT NULL, 
	message_text TEXT NOT NULL, 
	is_read BOOL, 
	created_at TIMESTAMP NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	FOREIGN KEY(sender_id) REFERENCES users (id), 
	FOREIGN KEY(receiver_id) REFERENCES users (id), 
	FOREIGN KEY(car_id) REFERENCES cars (id)
);
