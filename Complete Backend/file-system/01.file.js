const filepath = "files/sample.txt"

const fs = require("fs")
const path = require("path")
const fsPromise = require("fs").promises

//version 1

// fs.readFile(filepath, "utf-8", (err, data) => {
//   if (err) return err
//   console.log(data)
// })

// version 2

// fs.readFile(
//   path.join(__dirname, "files", "sample.txt"),
//   "utf-8",
//   (err, data) => {
//     if (err) console.log(err)
//     console.log(data)
//   }
// )

// version 3

// try {
//   const data = fs.readFileSync(
//     path.join(__dirname, "files", "sample.txt"),
//     "utf-8"
//   )
//   console.log(data)
// } catch (err) {
//   console.log(err)
// }

// version 4 with promise

// const fileReading = async () => {
//   try {
//     const data = await fsPromise.readFile(
//       path.join(__dirname, "files", "sample.txt"),
//       { encoding: "utf-8" }
//     )
//     console.log(data)
//   } catch (err) {
//     console.log(err)
//   }
// }

// fileReading()

// writing into files

const textfilepath = "files/text.txt"
const content = "writing from node file system"

fs.writeFile(textfilepath, content, (err) => {
  if (err) throw new Error(err)
  console.log("write operation completed successfully")
  fs.readFile(textfilepath, "utf-8", (err, data) => {
    if (err) throw new Error(err)
    console.log(data)
  })
})

// with promises
const readWithPromise = async () => {
  try {
    await fsPromise.writeFile(textfilepath, "write inside file using promise")
    await fsPromise.appendFile(
      textfilepath,
      "\nthis is new file add using promise"
    )
    const data = await fsPromise.readFile(textfilepath, { encoding: "utf-8" })
    console.log(data)
    await fs.promises.rename(
      textfilepath,
      path.join(__dirname, "files", "newtxt.txt")
    )
  } catch (err) {
    console.log(err)
  }
}
readWithPromise()
