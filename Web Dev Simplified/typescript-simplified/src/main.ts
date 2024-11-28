// array
const arr: number[] = [1, 2, 3, 4, 5]
console.log(arr)

// tuple
const tuple: [number, string] = [1, "hello"]
console.log(tuple)

// enum
enum Color {
  Red,
  Green,
  Blue,
}
const color: Color = Color.Red
console.log(color)

// any
let anyValue: any = 4
anyValue = "hello"
console.log(anyValue)

// void
function sayHello(): void {
  console.log("hello")
}
sayHello()

// never
// function throwError(): never {
//   throw new Error('error')
// }
// throwError()

// function
function add(a: number, b: number): number {
  return a + b
}
console.log(add(1, 2))

// object
function printObject(obj: { name: string; age: number }) {
  console.log(obj)
}
printObject({ name: "John", age: 30 })

// rest parameter
function sum(...args: number[]): number {
  return args.reduce((acc, cur) => acc + cur, 0)
}
console.log(sum(1, 2, 3, 4, 5))

// spread operator
const arr1 = [1, 2, 3]
const arr2 = [4, 5, 6]
const arr3 = [...arr1, ...arr2]
console.log(arr3)

// spread operator with rest parameter in function
function sumAll(...args: number[]): number {
  return args.reduce((acc, cur) => acc + cur, 0)
}
const numbers = [1, 2, 3, 4, 5]
console.log(sumAll(...numbers))

// type assertion
const value: any = "hello"
const length = (value as string).length
console.log(length)

// union type
function printId(id: number | string) {
  console.log(id)
}
printId(1)
printId("hello")

// type alias
type Id = number | string
function printId2(id: Id) {
  console.log(id)
}
printId2(1)
printId2("hello")

// interface
interface Person {
  name: string
  age: number
}
function printPerson(person: Person) {
  console.log(person)
}
printPerson({ name: "John", age: 30 })

// optional property
interface Person2 {
  name: string
  age?: number
}
function printPerson2(person: Person2) {
  console.log(person)
}
printPerson2({ name: "John" })

// readonly property
interface Person3 {
  readonly name: string
}
const person: Person3 = { name: "John" }
// person.name = 'Jane'

// index signature
interface Person4 {
  name: string
  [key: string]: any
}
const person2: Person4 = { name: "John", age: 30 }
console.log(person2)

// generic
const getSecondElement = <T>(arr: T[]): T => arr[1]

const secondElementNumber = getSecondElement([1, 2, 3])
console.log(secondElementNumber)
const secondElementString = getSecondElement(["hello", "world"])
console.log(secondElementString)

const arrayToObj = <T>(arr: [string, T][]): { [key: string]: T } =>
  arr.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

const arrGen: [string, number | string | boolean][] = [
  ["keyOne", 1],
  ["keyTwo", "valueTwo"],
  ["keyThree", true],
]

const obj = arrayToObj(arrGen)
console.log(obj)

// async functions
const wait = (duration: number): Promise<string> => {
  return new Promise<string>((resolve) => {
    setTimeout(resolve, duration)
  })
}

// pick and omit
type Person5 = {
  name: string
  age: number
  address: string
}
type PersonName = Pick<Person5, "name" | "age">
type PersonWithoutAddress = Omit<Person5, "address">

// partial and required
type Person6 = {
  name: string
  age?: number
}
type PersonRequired = Required<Person6>
type PersonPartial = Partial<Person6>

// required with pick
type PersonNameRequired = Required<Pick<Person5, "name" | "age">>
const personNameRequired: PersonNameRequired = { name: "John", age: 30 }
console.log(personNameRequired)

// partial with omit
type PersonWithoutAddressPartial = Partial<Omit<Person5, "address">>
const personWithoutAddressPartial: PersonWithoutAddressPartial = {
  name: "John",
}
console.log(personWithoutAddressPartial)

type RequiredPick<T, K extends keyof T> = Required<Pick<T, K>>
type PartialOmit<T, K extends keyof T> = Partial<Omit<T, K>>

// returntype
type Person7 = {
  name: string
  age: number
}
type PersonNameReturnType = ReturnType<() => Person7>
const personNameReturnType: PersonNameReturnType = { name: "John", age: 30 }
console.log(personNameReturnType)
// ReturnType in functions
function createPerson(name: string, age: number) {
  return { name, age }
}

type CreatePersonReturnType = ReturnType<typeof createPerson>
const newPerson: CreatePersonReturnType = createPerson("Alice", 25)
console.log(newPerson)

// Parameters
type CreatePersonParameters = Parameters<typeof createPerson>
const newPerson2: CreatePersonParameters = ["Alice", 25]
console.log(newPerson2)

// record
type PersonRecord = Record<string, Person7>
const people: PersonRecord = {
  john: { name: "John", age: 30 },
  jane: { name: "Jane", age: 25 },
}

// awaited
type Awaited<T> = T extends Promise<infer U> ? U : T
type AwaitedString = Awaited<Promise<string>>
const awaitedString: AwaitedString = "hello"
console.log(awaitedString)

// function overload
function add2(a: number, b: number): number
function add2(a: string, b: string): string
function add2(a: any, b: any): any {
  return a + b
}
console.log(add2(1, 2))
console.log(add2("hello", "world"))
