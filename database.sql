CREATE TABLE IF NOT EXISTS `jumper` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `fnac` DATE NOT NULL,
  `correo` VARCHAR(50),
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `user` (
  `iduser` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(10) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`iduser`)
);

CREATE TABLE IF NOT EXISTS `admin` (
  `idadmin` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(10) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idadmin`)
);

CREATE TABLE IF NOT EXISTs `pJumper` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `fnac` DATE NOT NULL,
  PRIMARY KEY(`id`)
);
CREATE TABLE IF NOT EXISTS `convenio` (
  `idconvenio` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `html` MEDIUMTEXT NOT NULL,
  PRIMARY KEY(`idconvenio`)
);
CREATE TABLE IF NOT EXISTS `convinfo` (
  `idinfo` INT(11) NOT NULL AUTO_INCREMENT,
  `idconv` INT(11) NOT NULL,
  `rut` VARCHAR(12),
  `correo` VARCHAR(50),
  `name` VARCHAR(50),
  `ape` VARCHAR(50),
  `cargo` VARCHAR(50),
  `addr` VARCHAR(50),
  `comuna` VARCHAR(50),
  `zona` VARCHAR(50),
  PRIMARY KEY(`idinfo`),
  FOREIGN KEY(`idconv`) REFERENCES convenio(idconvenio)
);
CREATE TABLE IF NOT EXISTS `Productos` (
  `idquiz` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `link` VARCHAR(200) NOT NULL,
  `activated` BOOL DEFAULT TRUE,
  `idproyect` INT(11) NOT NULL,
  PRIMARY KEY (`idquiz`)
);

CREATE TABLE IF NOT EXISTS `visita` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `idjumper` INT(11) NOT NULL,
  `duration` INT(11),
  `date_g`	DATE NOT NULL,
  `status`	VARCHAR(30),
  PRIMARY KEY(`id`),
  FOREIGN KEY(`idjumper`) REFERENCES jumper(id)
  );
  
CREATE TABLE IF NOT EXISTS `vip` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45),
  `fnac` DATE NULL,
  `date_f`	DATETIME NOT NULL,
  `ended` INT(1),
  PRIMARY KEY(`id`)
  );
ALTER TABLE visita ADD COLUMN conv