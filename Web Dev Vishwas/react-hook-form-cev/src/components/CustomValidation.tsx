import { useForm } from "react-hook-form"
import { DevTool } from "@hookform/devtools"

type FormValues = {
  username: string
  email: string
  channel: string
}

export default function CustomValidation() {
  const { register, control, handleSubmit, formState } = useForm<FormValues>()
  const { errors } = formState

  const onSubmit = (data: FormValues) => {
    console.log(data)
  }

  return (
    <>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label htmlFor="username">username</label>
          <input
            type="text"
            id="username"
            {...register("username", {
              required: "username is required",
            })}
          />
          <p className="error">{errors.username?.message}</p>

          <label htmlFor="email">email</label>
          <input
            type="text"
            id="email"
            {...register("email", {
              required: "email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "invalid email format",
              },

              // for a single validation rule
              // validate: (fieldValue) => {
              // 	return fieldValue !== "admin@example.com"
              // 		|| "enter a different email address"
              // }

              // for multiple validation rule
              validate: {
                notAdmin: (fieldValue) => {
                  return (
                    fieldValue !== "admin@example.com" ||
                    "please try with different email"
                  )
                },
                notBlackListed: (fieldValue) => {
                  return (
                    !fieldValue.endsWith("baddomain.com") ||
                    "this domain is not supported"
                  )
                },
                notExist: async (fieldValue) => {
                  const res = await fetch(
                    `https://jsonplaceholder.typicode.com/users?email=${fieldValue}`
                  )
                  const data = await res.json()
                  return data.length == 0 || "email already exist"
                },
              },
            })}
          />
          <p className="error">{errors.email?.message}</p>

          <label htmlFor="channel">channel</label>
          <input
            type="text"
            id="channel"
            {...register("channel", {
              required: "channel is required",
            })}
          />
          <p className="error">{errors.channel?.message}</p>

          <button>submit</button>
        </form>
      </div>
      <DevTool control={control} />
    </>
  )
}
