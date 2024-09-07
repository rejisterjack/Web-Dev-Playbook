// // destructuring

// const person = {
//   name: "John",
//   age: 33,
//   job: "developer",
// }

// const { name, age, job } = person

// console.log(name, age, job)

// const numbers = [1, 2, 3, 4, 5]
// const [first, second, third] = numbers
// console.log(first, second, third)

// function nameToFistAndLastName(name) {
//   const [firstName, lastName] = name.split(" ")
//   return { firstName, lastName }
// }

// const { firstName, lastName } = nameToFistAndLastName("John Doe")
// console.log(firstName, lastName)

// function addAndMultiply(arguments) {
//   console.log(arguments)
// }

// addAndMultiply(1,2,3,4)

// // null coalescing operator
// const name = null
// const result = name ?? "default" // only applicable for null or undefined, or it will return the value
// console.log(result)

// // optional chaining
// const person = {
//   name: "John",
//   age: 33,
//   job: "developer",
// }

// console.log(person?.name?.length) // if the property is not found, it will return undefined

// Map
// const map = new Map()
// map.set("name", "John")
// map.set("age", 33)

// console.log(map)

// const map2 = new Map([["a", 1], ["b", 2]])
// console.log(map2)
// map2.forEach((value, key) => console.log(key, value))

// generator and iterator
// function* generator() {
//   yield 1
//   yield 2
//   yield 3
// }

// const gen = generator()
// console.log(gen.next())
// console.log(gen.next())

// function* fibbonaciGenerator() {
//   let prevOne = 0
//   let prevTwo = 1

//   yield prevOne
//   yield prevTwo

//   while (true) {
//     const current = prevOne + prevTwo
//     yield current

//     prevOne = prevTwo
//     prevTwo = current
//   }
// }

// const fib = fibbonaciGenerator()
// console.log(fib.next())
// console.log(fib.next())
// console.log(fib.next())
// console.log(fib.next())
// console.log(fib.next())
// console.log(fib.next())

// gettters and setters
// const person = {
//   name: "John",
//   age: 33,
//   job: "developer",
//   get fullName() {
//     return `${this.name} Doe`
//   },
//   set fullName(value) {
//     this.name = value
//   },
// }

// console.log(person.fullName)
// person.fullName = "Jane"
// console.log(person.fullName)

// polyfill
// if (!String.prototype.trim) {
//   String.prototype.trim = function() {
//     return this.replace(/^\s+|\s+$/g, "")
//   }
// }

// console.log("  hello  ".trim())

// ========================== object oriented programming ================================

function Person(name, age) {
  this.name = name
  this.age = age
}

Person.prototype.sayHello = function() {
  console.log(`Hello, my name is ${this.name}`)
}

const john = new Person("John", 33)
john.sayHello()

console.log(john)

class Student extends Person {
  constructor(name, age, grade) {
    super(name, age);
    this.grade = grade;
  }

  getGrade() {
    return this.grade;
  }

  setGrade(grade) {
    this.grade = grade;
  }
}

const jane = new Student("Jane", 18, "A");
jane.sayHello();
console.log(jane);
console.log(jane.getGrade());
