function sortAndJoin(num1, num2) {
    let parsedNum1 = parseFloat(num1);
    let parsedNum2 = parseFloat(num2);
  
    let higherNum = Math.max(parsedNum1, parsedNum2);
    let lowerNum = Math.min(parsedNum1, parsedNum2);
    return higherNum >= 90000 ? higherNum + "history" : `${lowerNum}_${higherNum}history`;
}

module.exports = sortAndJoin;