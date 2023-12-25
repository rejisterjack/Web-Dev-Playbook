// %s for string
// %d for number

const name = "rupam"
const age = 23

console.log("my name is %s, and age is %d", name, age)

const sum = () => console.log(`sum of 2 and 3 is ${2 + 3}`)
const mul = () => console.log(`mul of 2 and 3 is ${2 * 3}`)

const mes = () => {
  console.time("sum()")
  sum()
  console.timeEnd("sum()")

  console.time("mul()")
  mul()
  console.timeEnd("mul()")
}

mes()
