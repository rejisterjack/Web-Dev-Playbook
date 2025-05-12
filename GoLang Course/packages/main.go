package main

import (
	"fmt"
	// "packages/math"
)

func main() {
	// fmt.Println("Add 2 + 3:", math.Add(2, 3))

	// data types
	var i int = 10

	var f float64 = 10.5

	var bl bool = true
	var s string = "Hello, World!"

	var arr [3]int = [3]int{1, 2, 3}
	var slice []int = []int{1, 2, 3}

	var m map[string]int = map[string]int{"one": 1, "two": 2}
	var ptr *int // nill

	fmt.Println("Integer:", i)
	fmt.Println("Float:", f)
	fmt.Println("Boolean:", bl)
	fmt.Println("String:", s)
	fmt.Println("Array:", arr)
	fmt.Println("Slice:", slice)
	fmt.Println("Map:", m)
	fmt.Println("Pointer:", ptr)

	// Type conversions
	var x int = 42
	var y float64 = float64(x)
	var z int = int(y)
	var a string = fmt.Sprintf("%d", x)
	var b int64 = int64(x)
	var c uint = uint(x)

	fmt.Println("Integer to Float:", y)
	fmt.Println("Float to Integer:", z)
	fmt.Println("Integer to String:", a)
	fmt.Println("Integer to Int64:", b)
	fmt.Println("Integer to Unsigned Int:", c)

	const (
		PI       = 3.14
		MAX_SIZE = 100
	)

	fmt.Printf("PI: %f\n", PI)
	fmt.Printf("MAX_SIZE: %d\n", MAX_SIZE)
}
