import { useForm } from "react-hook-form"
import { DevTool } from "@hookform/devtools"

type FormValues = {
  username: string
  email: string
  channel: string
  age: number
  dob: Date
}

export default function DateNumber() {
  const { register, control, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: {
      username: "",
      email: "",
      channel: "",
      age: 0,
      dob: new Date(),
    },
  })
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

          <label htmlFor="age">age</label>
          <input
            type="number"
            id="age"
            {...register("age", {
              required: "age is required",
              valueAsNumber: true,
            })}
          />
          <p className="error">{errors.age?.message}</p>

          <label htmlFor="dob">date of birth</label>
          <input
            type="date"
            id="dob"
            {...register("dob", {
              required: "date of birth is required",
              valueAsDate: true,
            })}
          />
          <p className="error">{errors.dob?.message}</p>

          <button>submit</button>
        </form>
      </div>
      <DevTool control={control} />
    </>
  )
}
