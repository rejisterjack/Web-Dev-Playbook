import React from "react"
import { render, screen } from "@testing-library/react"
import Contact from "../Contact"
import { describe, expect, it } from "vitest"
import "@testing-library/jest-dom"

describe("Contact Component", () => {
  it("renders the Contact component", () => {
    render(<Contact />)

    const buttonElement = screen.getByRole("button")
    expect(buttonElement).toBeVisible()
  })
})
