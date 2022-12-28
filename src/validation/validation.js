const mongoose=require("mongoose")


const isValidRequestBody = function (requestBody) {
    // console.log(requestBody)
    return Object.keys(requestBody).length > 0
    
}
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number' && value.toString().trim().length === 0) return false
    if (typeof value === 'boolean' && value.trim().length === 0) return false


    return true;
}

function isValidName(name){
  const re = /^[A-Z a-z ]+$/;
  return re.test(name)
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




const isValidPincode = (value) => {
    return (/^[1-9][0-9]{5}$/).test(value)
}
const isValidProfileImage = (value) => {
    return (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/).test(value)
}

const isValidPrice = (value) => {
    return (/^(?:0|[1-9]\d*)(?:\.(?!.*000)\d+)?$/).test(value)
}
const isValidInstallment = (value) => {
    return (/^[0-9]+$/).test(value)
}

module.exports={ isValidRequestBody, isValid,isValidName, isValidEmail, isValidPassword,isValidPhone,isValidPincode , isValidProfileImage, isValidPrice,isValidInstallment }
