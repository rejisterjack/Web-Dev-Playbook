import { Button, Input } from "@fluentui/react-components"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

// Define schema using zod
const schema = z.object({
  phoneNumber: z.string().length(10, "Phone number must be exactly 10 digits"), // Enforce 10 digits exactly
})

const PhoneNumberComponent = () => {
  // Destructure methods from useForm
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { phoneNumber: "" },
    resolver: zodResolver(schema),
  })

  // Function to handle form submission
  const onSubmit = (data: any) => {
    console.log(data)
  }

  // Function to handle numeric-only input
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "") // Remove non-numeric characters
    setValue("phoneNumber", value) // Update the form value
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      {/* Bind input field to form using register and handleNumericInput */}
      <Input
        {...register("phoneNumber")}
        placeholder="Enter your phone number"
        maxLength={10} // Enforce max length
        inputMode="numeric" // Show numeric keyboard on mobile
        onChange={handleNumericInput} // Handle numeric-only input
      />
      {errors.phoneNumber && <span>{errors.phoneNumber.message}</span>}

      <Button type="submit" appearance="primary">
        Submit
      </Button>
    </form>
  )
}

export default PhoneNumberComponent
