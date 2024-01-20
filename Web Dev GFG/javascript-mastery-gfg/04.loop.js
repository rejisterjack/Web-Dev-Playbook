function findSubstringIndex(mainString, subString) {
  for (let i = 0; i <= mainString.length - subString.length; i++) {
      let match = true;
      for (let j = 0; j < subString.length; j++) {
          if (mainString[i + j] !== subString[j]) {
              match = false;
              break;
          }
      }
      if (match) {
          return i; // Return the index if the substring is found
      }
  }
  return -1; // Return -1 if the substring is not found
}

let s = "Hello";
let p = "llo";

let output = findSubstringIndex(s, p);

console.log(output);
