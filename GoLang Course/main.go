package main

import (
	"fmt"
	// "github.com/google/uuid"
)

func main() {
	// fmt.Println("Hello, World!")
	// fmt.Println(uuid.New().String())

	var i int
	var fl float32

	var b bool
	var str string

	var arr [3]int
	var slice []int

	var m map[string]int
	var ptr *string

	fmt.Println(i)
	fmt.Println(fl)
	fmt.Println(b)
	fmt.Println(str)
	fmt.Println(arr)
	fmt.Println(slice)
	fmt.Println(m)
	fmt.Println(ptr)

	const (
		one = iota // default value is 0 and go so on for remaining
		two
		three
	)

	fmt.Println(one, two, three)
	
}
