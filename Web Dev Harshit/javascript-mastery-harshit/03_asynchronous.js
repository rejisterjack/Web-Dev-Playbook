// javascript is synchronous single threaded

// synchronous programming

// console.log("script start")
// for (let i = 0; i < 10000; i++) {
//   console.log("inside function")
// }
// console.log("script end")

// setTimeout

/* console.log("script start")

// setTimeout returns its id
const id = setTimeout(()=>{
console.log("inside setTimeout")
},1000)

// to clear the timeout
clearTimeout(id)

console.log("script end") */

// setInterval

// console.log("script start")
// const interValId = setInterval(() => console.log("inside interval"), 1000)
// clearInterval(interValId)
// console.log("script end")

// callbacks

// function printNum(num1, num2, callback) {
//   console.log(callback(num1, num2))
// }

// // callback function
// function numbersSum(number1, number2) {
//   return number1 + number2
// }

// printNum(3, 4, numbersSum)

// callback hell

// function changeText(element, text, color, time, onSuccess, onFailure) {
//   setTimeout(() => {
//     element.textElement = text
//     element.style.color = color
//     if (onSuccess) {
//       onSuccess()
//     } else if (onFailure) {
//       onFailure()
//     }
//   }, time)
// }

// const heading1 = document.querySelector(".heading1")
// const heading2 = document.querySelector(".heading2")
// const heading3 = document.querySelector(".heading3")
// const heading4 = document.querySelector(".heading4")
// const heading5 = document.querySelector(".heading5")
// const heading6 = document.querySelector(".heading6")
// const heading7 = document.querySelector(".heading7")
// const heading8 = document.querySelector(".heading8")
// const heading9 = document.querySelector(".heading9")
// const heading10 = document.querySelector(".heading10")

// //pyramid of dom
// changeText(heading1, "one", "red", 1000, () => {
//   changeText(heading2, "two", "blue", 1000, () => {
//     changeText(heading3, "three", "yellow", 1000, () => {
//       changeText(heading4, "four", "green", 1000, () => {
//         changeText(heading5, "five", "red", 1000, () => {
//           changeText(heading6, "six", "blue", 1000, () => {
//             changeText(heading7, "seven", "yellow", 1000, () => {
//               changeText(heading8, "eight", "green", 1000, () => {
//                 changeText(heading9, "nine", "red", 1000, () => {
//                   changeText(heading10, "ten", "blue", 1000, () => {})
//                 })
//               })
//             })
//           })
//         })
//       })
//     })
//   })
// })

// promises
// console.log("script start")
// const ingredients = ["rice", "vegetables", "salt"]

// for(let i=0;i<100;i++){
//   console.log("inside loop")
// }

// produce primise

// const myPromise = new Promise((resolve, reject) => {
//   if (
//     ingredients.includes("rice") &&
//     ingredients.includes("vegetables") &&
//     ingredients.includes("salt")
//   ) {
//     resolve("you can make fried rice")
//   } else {
//     reject(new Error("you can't make fried rice"))
//   }
// })

//consume promise

// myPromise.then((res) => console.log(res)).catch((err) => console.log(err))

// setTimeout(()=>{
//   console.log("inside set timeout")
// }, 0)

// console.log("script end")

// promisify callback hell

// function changeText(element, text, color) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       if (element) {
//         element.innerText = text
//         element.style.color = color
//         resolve()
//       } else {
//         reject()
//       }
//     }, 1000)
//   })
// }

// const heading1 = document.querySelector(".heading1")
// const heading2 = document.querySelector(".heading2")
// const heading3 = document.querySelector(".heading3")
// const heading4 = document.querySelector(".heading4")
// const heading5 = document.querySelector(".heading5")
// const heading6 = document.querySelector(".heading6")
// const heading7 = document.querySelector(".heading7")
// const heading8 = document.querySelector(".heading8")
// const heading9 = document.querySelector(".heading9")
// const heading10 = document.querySelector(".heading10")

// changeText(heading1, "one", "red")
//   .then(() => changeText(heading2, "two", "blue"))
//   .then(() => changeText(heading3, "three", "yellow"))
//   .then(() => changeText(heading4, "four", "green"))
//   .then(() => changeText(heading5, "five", "red"))
//   .then(() => changeText(heading6, "six", "blue"))
//   .then(() => changeText(heading7, "seven", "yellow"))
//   .then(() => changeText(heading8, "eight", "green"))
//   .then(() => changeText(heading9, "nine", "red"))
//   .then(() => changeText(heading10, "ten", "blue"))

/*
// ajax ->  asynchronous javascript and xml

const URL = "https://jsonplaceholder.typicode.com/posts"
const xhr = new XMLHttpRequest()

xhr.open("GET", URL)

// method one
// xhr.onreadystatechange = function () {
//   if (xhr.readyState === 4) {
//     const response = xhr.response
//     const data = JSON.parse(response)
//     console.log(data)
//   }
// }

// method two
// onload only happens when (xhr.readyState === 4
xhr.onload = function () {
  const response = xhr.response
  const data = JSON.parse(response)
  console.log(data)
}

xhr.send() 
*/

/*
// fetch
fetch("https://jsonplaceholder.typicode.com/posts/1", {
  method: "PUT",
  body: JSON.stringify({
    id: 1,
    title: "foo",
    body: "bar",
    userId: 1,
  }),
  headers: {
    "Content-type": "application/json; charset=UTF-8",
  },
})
  .then((response) => response.json())
  .then((json) => console.log(json))
  */

  /*
  // async await8888iu
  const posts = async ()=>{
    const response = await fetch("https://jsonplaceholder.typicode.com/posts")
    const data = await response.json()
    return data
  }

  posts().then((data)=>console.log(data))
  */