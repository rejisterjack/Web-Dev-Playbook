// let b = 5
// let vari = null
// vari = undefined

// type Address = {
//   street?: string
// }

// function myFunc(name: string, age: number, address: Address = {}) {
//   console.log(name, age, address)
// }

// myFunc("rupam", 24, { street: "main st" })
// myFunc("rupam", 24)

// union type

// let myValue:number | string
// myValue = 3
// myValue = "rupam"

// intersection type

// type Person = {
//   name: string
//   age: number
// }

// type PersonWithId = Person & {
//   id: number
// }

// let myName: Person = { name: "rupam", age: 23 }
// let yourName: PersonWithId = { name: "das", age: 23, id: 1 }

// keyof and typeof

// const myObj1 = { name: "rupam", age: 23 }
// type Person = typeof myObj1
// function myFunc(key: keyof Person, obj: Person) {
//   console.log(obj[key])
// }
// myFunc("age", myObj1)

// const SKILL_LEVELS = ["beginner", "intermediate", "expert"] as const
// type Skills = (typeof SKILL_LEVELS)[number]
// let mySkill: Skills = "beginner"
// console.log(mySkill)

// const person = {
//   name: "rupam",
//   age: 23
// }

// console.log(Object.entries(person))

// generics


