const mongoose=require("mongoose")


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

function isValidEmail(email) {
    const regx = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
    return regx.test(String(email).toLowerCase());
}

function isValidPhone(phone) {
    const regx = /^[6-9]\d{9}$/;
    return regx.test(phone);
}







module.exports={isValidRequestBody, isValid, isValidtitle, isValidEmail,isValidPhone}
