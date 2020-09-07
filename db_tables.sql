CREATE TABLE users(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    email VARCHAR(128) NOT NULL,
    password VARCHAR(128) NOT NULL,
    f_name VARCHAR(32) NOT NULL,
    l_name VARCHAR(32) NOT NULL,
    gender CHAR(1) NOT NULL,
    user_type CHAR(1) NOT NULL,
    date_of_birth DATE NOT NULL,
    profile_pic BIGSERIAL,
    registration_date DATE DEFAULT CURRENT_DATE NOT NULL,
    bio VARCHAR(512)
);

CREATE TABLE messages(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    from_id BIGSERIAL,
    to_id BIGSERIAL,
    time_of_send TIMESTAMP,
    msg VARCHAR (64)
);

CREATE TABLE property(
    prop_id BIGSERIAL NOT NULL PRIMARY KEY,
    prop_address VARCHAR(32),
    prop_city VARCHAR(16),
    prop_province VARCHAR(2),
    prop_country VARCHAR(2),
    longitude DECIMAL(7,5),
    latitude DECIMAL(7,5),
    landlord BIGSERIAL,
    info VARCHAR(1024),
    price INT,
    bedrooms SMALLINT,
    utils BOOLEAN,
    parking SMALLINT,
    furnished BOOLEAN,
    bathroom SMALLINT,
    sqr_area DECIMAL(8,2),
    preferred_unit CHAR(2)
);

CREATE TABLE room(
    room_id BIGSERIAL NOT NULL PRIMARY KEY,
    parent_prop_id BIGSERIAL,
    sqr_area DECIMAL(8,2)
);

CREATE TABLE property_pic(
    prop_id BIGSERIAL NOT NULL PRIMARY KEY,
    img_id BIGSERIAL NOT NULL
);

CREATE TABLE room_pic(
    room_id BIGSERIAL NOT NULL PRIMARY KEY,
    img_id BIGSERIAL NOT NULL
);

CREATE TABLE img(
    img_id BIGSERIAL NOT NULL PRIMARY KEY,
    owner_id BIGSERIAL,
    sent_to BIGSERIAL,
    img_loc VARCHAR(128)
);

CREATE TABLE favorites (
    favorites_id BIGSERIAL NOT NULL PRIMARY KEY,
    user_id BIGSERIAL,
    prop_id BIGSERIAL,
    liked BOOLEAN,
    decision_date TIMESTAMP,
    unmatched_date TIMESTAMP
);

CREATE TABLE blocked (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    blocker_id BIGSERIAL,
    blocked_id BIGSERIAL
);


