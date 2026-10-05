-- Starter data for the dropdowns (cities, brands, car models)

INSERT INTO `cities` (`id`, `name`, `province`) VALUES (1, 'Karachi', 'Sindh');
INSERT INTO `cities` (`id`, `name`, `province`) VALUES (2, 'Lahore', 'Punjab');
INSERT INTO `cities` (`id`, `name`, `province`) VALUES (3, 'Islamabad', 'Islamabad Capital Territory');
INSERT INTO `cities` (`id`, `name`, `province`) VALUES (4, 'Rawalpindi', 'Punjab');
INSERT INTO `cities` (`id`, `name`, `province`) VALUES (5, 'Faisalabad', 'Punjab');

INSERT INTO `brands` (`id`, `name`, `logo_url`) VALUES (1, 'Toyota', NULL);
INSERT INTO `brands` (`id`, `name`, `logo_url`) VALUES (2, 'Honda', NULL);
INSERT INTO `brands` (`id`, `name`, `logo_url`) VALUES (3, 'Suzuki', NULL);
INSERT INTO `brands` (`id`, `name`, `logo_url`) VALUES (4, 'KIA', NULL);

INSERT INTO `car_models` (`id`, `brand_id`, `name`) VALUES (1, 1, 'Corolla');
INSERT INTO `car_models` (`id`, `brand_id`, `name`) VALUES (2, 1, 'Yaris');
INSERT INTO `car_models` (`id`, `brand_id`, `name`) VALUES (3, 2, 'Civic');
INSERT INTO `car_models` (`id`, `brand_id`, `name`) VALUES (4, 2, 'City');
INSERT INTO `car_models` (`id`, `brand_id`, `name`) VALUES (5, 3, 'Alto');
INSERT INTO `car_models` (`id`, `brand_id`, `name`) VALUES (6, 3, 'Cultus');
INSERT INTO `car_models` (`id`, `brand_id`, `name`) VALUES (7, 4, 'Sportage');

