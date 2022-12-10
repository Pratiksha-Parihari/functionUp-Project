const mongoose=require("mongoose")
const moment = require('moment')


const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number' && value.toString().trim().length === 0) return false

    return true;
}

function isValidtitle(title) {
    return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1
}

function isValidName(name) {
    const regx = /^[A-Za-z ]+$/;
    return regx.test(name);
}

function isValidEmail(email) {
    const regx = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
    return regx.test(String(email).toLowerCase());
}
function isValidPassword(password) {
    const regx = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/;
    return regx.test(password);
}

function isValidPhone(phone) {
    const regx = /^[6-9]\d{9}$/;
    return regx.test(phone);
}
function isValidRating(rating){
    const re= /\d+/;
    return re.test(rating);

}
function isValidISBN(ISBN){
    const re= /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/;
    return re.test(ISBN);

}

function isValidDate(date) {
    if (typeof date != "string") return false
    return moment(date, 'YYYY-MM-DD', true).isValid()
  }





module.exports={ isValidRequestBody, isValid, isValidtitle, isValidName, isValidEmail, isValidPassword,isValidPhone, isValidRating, isValidISBN, isValidDate}
