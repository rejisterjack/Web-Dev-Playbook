// array
const arr: number[] = [1, 2, 3, 4, 5]
console.log(arr)

// tuple
const tuple: [number, string] = [1, 'hello']
console.log(tuple)

// enum
enum Color {
  Red,
  Green,
  Blue
}
const color: Color = Color.Red
console.log(color)

// any
let anyValue: any = 4
anyValue = 'hello'
console.log(anyValue)

// void
function sayHello(): void {
  console.log('hello')
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
printObject({ name: 'John', age: 30 })

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
const value: any = 'hello'
const length = (value as string).length
console.log(length)

// union type
function printId(id: number | string) {
  console.log(id)
}
printId(1)
printId('hello')

// type alias
type Id = number | string
function printId2(id: Id) {
  console.log(id)
}
printId2(1)
printId2('hello')

// interface
interface Person {
  name: string
  age: number
}
function printPerson(person: Person) {
  console.log(person)
}
printPerson({ name: 'John', age: 30 })

// optional property
interface Person2 {
  name: string
  age?: number
}
function printPerson2(person: Person2) {
  console.log(person)
}
printPerson2({ name: 'John' })

// readonly property
interface Person3 {
  readonly name: string
}
const person: Person3 = { name: 'John' }
// person.name = 'Jane'

// index signature
interface Person4 {
  name: string
  [key: string]: any
}
const person2: Person4 = { name: 'John', age: 30 }
console.log(person2)
