create table users(
    id int primary key AUTO_INCREMENT,
    name varchar(250),
    contact varchar(20),
    email varchar(100),
    password varchar(250),
    status varchar(20),
    role varchar(20),
    UNIQUE (email)
)

insert into users(name, contact, email, password, status, role);
value('ANGEL ISRAEL MORENO CASTELLANOS', '3334820276', 'aimc9801@gmail.com', 'Moca9801', 'true', 'admin');

create table category(
    id int not null AUTO_INCREMENT,
    name varchar(250),
    primary key(id) 
)


create table product(
    id int not null AUTO_INCREMENT,
    name varchar(250) NOT NULL,
    description varchar(255) NOT NULL, 
    category_id integer NOT NULL,
    price integer,
    status varchar(255),
    primary key(id),
    FOREIGN KEY (category_id) REFERENCES category(id)
)

create table bill(
    id int not null AUTO_INCREMENT,
    uuid varchar(200) not null,
    name varchar(250) not null,
    email varchar(100) not null,
    contact varchar(20) not null,
    paymentMethod varchar(50),
    total int not null,
    productDetails JSON DEFAULT NULL,
    createBy varchar(100) not null,
    primary key(id)
)