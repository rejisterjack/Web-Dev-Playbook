package main

import (
	"fmt"

	"github.com/google/uuid"
)

func main() {
	fmt.Println("Hello, World!")
	fmt.Println("This is a simple Go program.")
	fmt.Println(uuid.NewString())
}
