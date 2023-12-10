import { DevTool } from "@hookform/devtools"
import { Stack, TextField, Button } from "@mui/material"
import { useForm } from "react-hook-form"

type FormField = {
  email: string
  password: string
}

function FormWithMui() {
  const { register, handleSubmit, control, formState } = useForm<FormField>({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { errors } = formState

  const onsubmit = (fieldvalue: FormField) => console.log(fieldvalue)
  return (
    <>
      <form noValidate onSubmit={handleSubmit(onsubmit)}>
        <Stack spacing={2} width={400}>
          <TextField
            label="email"
            type="email"
            {...register("email", {
              required: "email is required",
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="password"
            type="password"
            {...register("password", { required: "password is required" })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button type="submit" variant="contained" color="primary">
            submit
          </Button>
        </Stack>
      </form>
      <DevTool control={control} />
    </>
  )
}

export default FormWithMui
