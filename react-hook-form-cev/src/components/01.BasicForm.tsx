import { useForm } from "react-hook-form"
import { DevTool } from "@hookform/devtools"

type FormValues = {
  username: string
  email: string
  channel: string
}

const BasicForm = () => {
  const { register, handleSubmit, control, formState } = useForm<FormValues>()

  const onSubmit = (data: FormValues) => {
    console.log(data)
  }
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            {...register("username", {
              required: "Username is required",
              minLength: {
                value: 4,
                message: "Minimum length is 4",
              },
            })}
          />
          <span>{formState.errors.username?.message}</span>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email address",
              },
              validate: {
                notAdmin: (value) =>value !== "admin@example.com" || "Admin is not allowed",
                notBlacklisted: (value) => !value.endsWith("example.com") || "Domain is not allowed",
              },
            })}
          />
          <span>{formState.errors.email?.message}</span>
        </div>
        <div className="form-group">
          <label htmlFor="channel">Channel</label>
          <input
            type="text"
            className="form-control"
            id="channel"
            {...register("channel", {
              required: "Channel is required",
              minLength: {
                value: 4,
                message: "Minimum length is 4",
              },
            })}
          />
          <span>{formState.errors.channel?.message}</span>
        </div>
        <button type="submit" className="btn btn-primary mt-2">
          Submit
        </button>
      </form>
      <DevTool control={control} />
    </div>
  )
}

export default BasicForm
