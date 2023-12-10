import { FieldErrors, useForm } from "react-hook-form"
import { DevTool } from "@hookform/devtools"
import { useEffect } from "react"

type FormValues = {
  username: string
  email: string
  channel: string
}

export default function YouTubeForm() {
  const { register, control, handleSubmit, formState, reset } =
    useForm<FormValues>()
  const {
    errors,
    isDirty,
    isValid,
    isSubmitSuccessful,
    isSubmitting,
    isSubmitted,
    submitCount,
    touchedFields,
    dirtyFields,
  } = formState

  // inside working
  // const { name, ref, onChange, onBlur } = register("username")

  const onSubmit = (data: FormValues) => {
    console.log(data)
  }

  const onError = (errors: FieldErrors<FormValues>) => {
    console.log(errors)
  }

  console.log("dirty state", isDirty)

  useEffect(() => {
    isSubmitSuccessful && reset()
  }, [isSubmitSuccessful, reset])

  return (
    <>
      <div>
        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
          {/* inside working */}
          {/* <label htmlFor="username">username</label>
				<input
					type="text"
					id="username"
					name={name}
					ref={ref}
					onChange={onChange}
					onBlur={onBlur}
				/> */}

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

          <button type="button" onClick={() => reset()}>
            reset
          </button>
          <button disabled={!isValid}>submit</button>
        </form>
      </div>
      <DevTool control={control} />
    </>
  )
}
