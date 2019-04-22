const screenText = document.querySelector('.screen-text');

const numpad0 = document.querySelector('.numpad0');
const numpad1 = document.querySelector('.numpad1');
const numpad2 = document.querySelector('.numpad2');
const numpad3 = document.querySelector('.numpad3');
const numpad4 = document.querySelector('.numpad4');
const numpad5 = document.querySelector('.numpad5');
const numpad6 = document.querySelector('.numpad6');
const numpad7 = document.querySelector('.numpad7');
const numpad8 = document.querySelector('.numpad8');
const numpad9 = document.querySelector('.numpad9');

const numpads = [
    numpad0,
    numpad1,
    numpad2,
    numpad3,
    numpad4,
    numpad5,
    numpad6,
    numpad7,
    numpad8,
    numpad9 ];


// enum for operations
const PLUS = 0;
const MINUS = 1;
const MULTIPLY = 2;
const DIVIDE = 3;


// also represents precendece
const OP_CODES = {
    0: "+",
    1: "-",
    2: "*",
    3: "/"
}

const plusBtn = document.querySelector('.plus');
const minusBtn = document.querySelector('.minus');
const multiplyBtn = document.querySelector('.multiply');
const divideBtn = document.querySelector('.divide');

const operationButtons = [plusBtn, minusBtn, multiplyBtn, divideBtn];

const delBtn = document.querySelector('.delete');

const ACBtn = document.querySelector('.AC');

const answerBtn = document.querySelector('.answer');

const equalsBtn = document.querySelector('.equals');


let answer = 0;
let buf = [];
const MAX_SCREEN_TEXT_LEN = 15;

main();

// runs when page is first loaded
function main() {

    numpads.forEach(function (numpad, index) {
        numpad.addEventListener('click', onNumpadXDown(index));
    });

    operationButtons.forEach(function (operationButton, index) {
        operationButton.addEventListener('click', onOperationXButtonDown(index));
    });

    delBtn.addEventListener('click', onDeleteButtonDown);

    ACBtn.addEventListener('click', onACButtonDown);

    equalsBtn.addEventListener('click', onEqualsDown);

    answerBtn.addEventListener('click', onAnswerButtonDown);
}

function onNumpadXDown(x) {
    return function() {
        if (screenText.textContent.length <= MAX_SCREEN_TEXT_LEN) {

            // you can always enter a digit,
            // as long as the max screenlength is not exceeded

            updateScreenText(screenText.textContent + x.toString());

            // either entering first elem in buf or the last element in buf is an operation
            if (buf.length === 0 || typeof(buf[buf.length - 1]) !== "number") {
                buf.push(x);
            }
            else { // concatenate x onto the last entered number
                buf[buf.length - 1] = +(buf[buf.length - 1].toString() + x.toString());
            }
        }
    }
}


// +, -, *, /
function onOperationXButtonDown(x) {

    // you can input an operation only if the following hold:
    // 1. doesn't overflow max screen space
    // 2. entering + or - into an empty screen
    // 3. buf is not empty and there is a number in the last entry

    return function() {
        if (screenText.textContent.length <= MAX_SCREEN_TEXT_LEN
            && (buf.length === 0 && (x === PLUS || x === MINUS)
            || buf.length !== 0 && typeof(buf[buf.length - 1]) === "number")) {
            
            updateScreenText(screenText.textContent + OP_CODES[x]);

            buf.push(OP_CODES[x]);
        }
    }
}

function onAnswerButtonDown() {
    if (screenText.textContent.length <= MAX_SCREEN_TEXT_LEN - 2
            && (buf.length === 0 || typeof(buf[buf.length - 1]) !== "number")) {
        updateScreenText(screenText.textContent + "Ans");
        buf.push(answer);
    }
}


function onDeleteButtonDown() {
    if (buf.length > 0) {

        updateScreenText(screenText.textContent.slice(0, -1));

        if (typeof(buf[buf.length - 1]) === "number"
            && buf[buf.length - 1].toString().length > 1) { // 2+ dig num: just strip off last char
            
            buf[buf.length - 1] = +(buf[buf.length - 1].toString().slice(0, -1));
        }
        else { // either 1 digit number or operation (or decimal?)
            buf.pop();
        }
    }
}


function onACButtonDown() {
    buf = [];
    updateScreenText("");
    answer = 0;
}

// Given an array of numbers/ops,
// looks at the array's 0th and 1th elements,
// applying unary if necessary,
// and returns an array with the 0th and 1th elements merged
// if unary was applied.
// Assumes buf.length >= 2.
function applyUnary(buf) {
    if (buf[0] === "+" && typeof(buf[1]) === "number") {
        buf.splice(0, 2, buf[1]);
    }
    else if (buf[0] === "-" && typeof(buf[1]) === "number") {
        buf.splice(0, 2, -buf[1]);
    }
}

// Given an array of numbers/ops,
// combines array numbers directly separated by * or /
// and returns the new array.
// Assumes already unary-ized, and no divisions by zero occur within buf.
// Note: might be able to optimize with index += 2.
function applyMultDiv(buf) {
    let index = 0;

    while (buf.length >= 3 && index < buf.length - 2) {
        let lhs      = buf[index];
        let operator = buf[index + 1];
        let rhs      = buf[index + 2];

        if (       typeof(lhs) === "number"
                && typeof(rhs) === "number"
                && (operator === "*" || operator === "/"))
            buf.splice(index, 3, operate(operator, lhs, rhs));
        else
            ++index;
    }
}

// Given an array of numbers/ops,
// combines array numbers directly separated by + or -
// and returns the new array.
// Assumes already unary-ized.
function applyPlusMinus(buf) {
    let index = 0;

    while (buf.length >= 3 && index < buf.length - 2) {
        let lhs      = buf[index];
        let operator = buf[index + 1];
        let rhs      = buf[index + 2];

        if (       typeof(lhs) === "number"
                && typeof(rhs) === "number"
                && (operator === "+" || operator === "-"))
            buf.splice(index, 3, operate(operator, lhs, rhs));
        else
            ++index;
    }
}

function containsDivisionByZero(buf) {
    let index = 0;

    while (index < buf.length - 2) {
        let lhs      = buf[index];
        let operator = buf[index + 1];
        let rhs      = buf[index + 2];

        if (       typeof(lhs) === "number"
                && typeof(rhs) === "number"
                && operator === "/"
                && rhs === 0)
            return true;
        else
            ++index;
    }

    return false;
}


function onEqualsDown() {
    if (buf.length === 0 || typeof(buf[buf.length - 1]) !== "number") {
        return; // don't do anything
    }
    else if (buf.length === 1) { // guaranteed to be a number
        answer = buf[0];
    }
    else if (containsDivisionByZero(buf)) {
        alert("Division by 0 error");
        answer = 0;
        buf = [];
    }
    else { // apply the general algorithm
        applyUnary(buf);
        applyMultDiv(buf);
        applyPlusMinus(buf);

        buf[0] = +buf[0].toFixed(6); // fix precision errors
        answer = buf[0];
        updateScreenText(answer);
    }
}

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {

    if (b === 0) {
        throw "Division by 0";
    }

    return a / b;
}

function operate(operator, a, b) {
    switch (operator) {
        case "+":
            return add(a, b);
        case "-":
            return subtract(a, b);
        case "*":
            return multiply(a, b);
        case "/":
            return divide(a, b);
        default:
            throw "operator not recognized";
    }
}

function updateScreenText(newText) {
    screenText.textContent = newText;
}