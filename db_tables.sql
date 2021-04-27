
DROP TABLE IF EXISTS users CASCADE;
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

DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    from_id BIGSERIAL,
    to_id BIGSERIAL,
    time_of_send TIMESTAMP,
    msg VARCHAR (64)
);

DROP TABLE IF EXISTS property CASCADE;
CREATE TABLE property(
    prop_id BIGSERIAL NOT NULL PRIMARY KEY,
    apt_num INT,
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
    avail_on DATE
);

DROP TABLE IF EXISTS room CASCADE;
CREATE TABLE room(
    room_id BIGSERIAL NOT NULL PRIMARY KEY ,
    parent_prop_id BIGSERIAL REFERENCES property(prop_id),
    sqr_area DECIMAL(8,2)
);

DROP TABLE IF EXISTS property_pic CASCADE;
CREATE TABLE property_pic(
    prop_id BIGSERIAL REFERENCES property(prop_id),
    order_num INT,
    info VARCHAR(512),
    img_id BIGSERIAL NOT NULL,
    PRIMARY KEY (prop_id, order_num)
);

DROP TABLE IF EXISTS room_pic CASCADE;
CREATE TABLE room_pic(
    room_id BIGSERIAL REFERENCES room(room_id),
    order_num INT,
    img_id BIGSERIAL NOT NULL,
    PRIMARY KEY (room_id, order_num)
);

DROP TABLE IF EXISTS img CASCADE;
CREATE TABLE img(
    img_id BIGSERIAL NOT NULL PRIMARY KEY,
    owner_id BIGSERIAL,
    sent_to BIGSERIAL,
    img_loc VARCHAR(128)
);

DROP TABLE IF EXISTS favorites CASCADE;
CREATE TABLE favorites (
    favorites_id BIGSERIAL NOT NULL PRIMARY KEY,
    user_id BIGSERIAL REFERENCES users(id),
    prop_id BIGSERIAL REFERENCES property(prop_id),
    liked BOOLEAN,
    decision_date TIMESTAMP,
    unmatched_date TIMESTAMP
);

DROP TABLE IF EXISTS blocked CASCADE;
CREATE TABLE blocked (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    blocker_id BIGSERIAL REFERENCES users(id),
    blocked_id BIGSERIAL REFERENCES users(id)
);


