// objects

type Person = {
  name: string
  age: number
  isDeveloper?: boolean
}

let obj: Person = {
  name: "John",
  age: 20,
}

obj.isDeveloper = true

console.log(obj)

// function

type Add = (a: number, b: number) => number
type Sub = (a: number, b: number) => void // function that does not return anything

const add: Add = (a, b) => a + b
const sub: Sub = (a, b) => console.log(a - b)

// functions with default values
const multiply = (a: number, b: number = 1) => a * b
const divide = (a: number, b: number = 1) => a / b

// functions with optional values
const sayHello = (name?: string) => {
  if (name) {
    console.log(`Hello ${name}`)
  } else {
    console.log("Hello")
  }
}

// functions with rest parameters
const sum = (...numbers: number[]) => {
  return numbers.reduce((acc, val) => acc + val, 0)
}

// 16. union types to be started
