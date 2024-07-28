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

// union types
type Status = "success" | "error" | "pending"
type TestUnion = string | { text: string }

// type and interface
interface User {
  name: string
  age: number
}

type User2 = {
  name: string
  age: number
  child: User
}

// extending interfaces
interface Admin extends User {
  role: string
}

// extending types
type Admin2 = User & {
  role: string
}

// intersection types
type Admin3 = User & {
  role: string
}

// type guards
const isAdmin = (user: User | Admin): user is Admin => {
  return (user as Admin).role !== undefined
}

// discriminated unions
type Success = {
  status: "success"
  data: string
}

type Error = {
  status: "error"
  message: string
}

type Response = Success | Error

// type aliases
type ID = string | number

// string literals
type Direction = "left" | "right" | "up" | "down"

// numeric literals
type OneToFive = 1 | 2 | 3 | 4 | 5

// boolean literals
type True = true
type False = false

// function overloads
function reverse(x: number): number
function reverse(x: string): string
function reverse(x: number | string): number | string {
  if (typeof x === "number") {
    return Number(x.toString().split("").reverse().join(""))
  } else if (typeof x === "string") {
    return x.split("").reverse().join("")
  }
}

// type assertions
const user = {} as User
const user2 = <User>{}

// keyof and typeof
type UserKeys = keyof User
type UserTypes = typeof User

// index types 
type UserProps = keyof User
type UserTypes2 = User[UserProps]

// as const and readonly and enum
const colors = {
  red: "red",
  blue: "blue",
  green: "green",
} as const

// typle
type Tuple = [number, string, boolean]

// generics
// type ValueOf<T> = T[keyof T]
// const input = document.querySelector("input") as HTMLInputElement
const input = document.querySelector<HTMLInputElement>("input")
console.log(input?.value)

function getSecond<T>(array: T[]) {
  return array[1]
}
const a = [1, 2, 3]
const b = ["a", "b", "c"]

const retA = getSecond(a)
const retB = getSecond(b)

// generic to be completed