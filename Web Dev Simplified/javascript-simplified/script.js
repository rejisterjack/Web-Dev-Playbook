// destructuring

const person = {
  name: "John",
  age: 33,
  job: "developer",
}

const { name, age, job } = person

console.log(name, age, job) 

const numbers = [1, 2, 3, 4, 5]
const [first, second, third] = numbers
console.log(first, second, third) 

function nameToFistAndLastName(name) {
  const [firstName, lastName] = name.split(" ")
  return { firstName, lastName }
}

const { firstName, lastName } = nameToFistAndLastName("John Doe")
console.log(firstName, lastName)

function addAndMultiply(arguments) {
  console.log(arguments)
}

addAndMultiply(1,2,3,4)