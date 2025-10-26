// How would you implement a calculator class with methods for addition,
// subtraction, and multiplication, supporting method chaining?
// calculator.add(3).multiply(4).subtract(5).getValue()

class Calculator {
  // write code here
  constructor(value = 0) {
    this.value = value
  }

  add(number) {
    this.value += number
    return this
  }
  multiply(number) {
    this.value *= number
    return this
  }
  subtract(number) {
    this.value -= number
    return this
  }

  getValue() {
    return this.value
  }
}
const calculator = new Calculator(2)
console.log(calculator.add(3).multiply(4).subtract(5).getValue()) //15
