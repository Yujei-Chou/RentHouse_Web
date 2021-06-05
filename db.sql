CREATE TABLE user_info
(
    user_num integer AUTO_INCREMENT,
    username varchar(50) NOT NULL,
    phone integer,
    email varchar(100), 
    PRIMARY KEY(user_num)
)ENGINE INNODB;
CREATE TABLE house_info
(
    house_num integer AUTO_INCREMENT,
    address varchar(50) NOT NULL,
    structures varchar(50),
    price integer,
    kind integer,
    fire integer,
    pet integer,
    user_num integer, 
    house_info varchar(300),
    picture1 varchar(100),
    picture2 varchar(100),
    region varchar(100),
    lat float,
    lng float,
    PRIMARY KEY(house_num), 
    FOREIGN KEY (user_num) REFERENCES user_info (user_num) ON DELETE CASCADE ON UPDATE CASCADE
)ENGINE INNODB;