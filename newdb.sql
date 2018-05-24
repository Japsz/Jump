-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema jump
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema jump
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `jump` DEFAULT CHARACTER SET utf8 ;
USE `jump` ;

-- -----------------------------------------------------
-- Table `jump`.`admin`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jump`.`admin` (
  `idadmin` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(10) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idadmin`))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jump`.`convenio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jump`.`convenio` (
  `idconvenio` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `html` MEDIUMTEXT NOT NULL,
  PRIMARY KEY (`idconvenio`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jump`.`convinfo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jump`.`convinfo` (
  `idinfo` INT(11) NOT NULL AUTO_INCREMENT,
  `idconv` INT(11) NOT NULL,
  `rut` VARCHAR(12) NULL DEFAULT NULL,
  `correo` VARCHAR(50) NULL DEFAULT NULL,
  `name` VARCHAR(50) NULL DEFAULT NULL,
  `ape` VARCHAR(50) NULL DEFAULT NULL,
  `cargo` VARCHAR(50) NULL DEFAULT NULL,
  `addr` VARCHAR(50) NULL DEFAULT NULL,
  `comuna` VARCHAR(50) NULL DEFAULT NULL,
  `zona` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`idinfo`),
  INDEX `convinfo_ibfk_1` (`idconv` ASC),
  CONSTRAINT `convinfo_ibfk_1`
    FOREIGN KEY (`idconv`)
    REFERENCES `jump`.`convenio` (`idconvenio`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jump`.`evento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jump`.`evento` (
  `idevento` INT(11) NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(45) NULL DEFAULT NULL,
  `tipo` VARCHAR(45) NULL DEFAULT NULL,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` VARCHAR(6) NULL DEFAULT NULL,
  `duration` INT(11) NULL DEFAULT NULL,
  `obs` MEDIUMTEXT NULL DEFAULT NULL,
  `asistentes` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`idevento`))
ENGINE = InnoDB
AUTO_INCREMENT = 12
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jump`.`jumper`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jump`.`jumper` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `fnac` DATE NOT NULL,
  `correo` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 17
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jump`.`pjumper`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jump`.`pjumper` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `fnac` DATE NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jump`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jump`.`user` (
  `iduser` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(10) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`iduser`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jump`.`vip`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jump`.`vip` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NULL DEFAULT NULL,
  `fnac` DATE NULL DEFAULT NULL,
  `date_f` DATETIME NOT NULL,
  `ended` INT(1) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 12
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jump`.`visita`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jump`.`visita` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `idjumper` INT(11) NOT NULL,
  `duration` INT(11) NULL DEFAULT NULL,
  `date_g` DATE NOT NULL,
  `status` VARCHAR(30) NULL DEFAULT NULL,
  `idinfo` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idjumper` (`idjumper` ASC),
  INDEX `idinfo_idx` (`idinfo` ASC),
  CONSTRAINT `idinfo`
    FOREIGN KEY (`idinfo`)
    REFERENCES `jump`.`convinfo` (`idinfo`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `visita_ibfk_1`
    FOREIGN KEY (`idjumper`)
    REFERENCES `jump`.`jumper` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 550
DEFAULT CHARACTER SET = utf8;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
