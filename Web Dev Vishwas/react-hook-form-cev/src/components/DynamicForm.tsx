import { useForm, useFieldArray } from "react-hook-form"
import { DevTool } from "@hookform/devtools"

type FormValues = {
  username: string
  email: string
  channel: string
  social: {
    twitter: string
    facebook: string
  }
  phoneNumbers: string[]
  phNumbers: {
    number: string
  }[]
}

export default function DynamicForm() {
  const { register, control, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: async function () {
      const res = await fetch("https://jsonplaceholder.typicode.com/users/1")
      const data = await res.json()
      return {
        username: "default name",
        email: data.email,
        channel: "default channel",
        social: {
          twitter: "",
          facebook: "",
        },
        phoneNumbers: ["", ""],
        phNumbers: [{ number: "" }],
      }
    },
  })
  const { errors } = formState

  const { fields, append, remove } = useFieldArray({
    name: "phNumbers",
    control,
  })

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

          <label htmlFor="twitter">twitter</label>
          <input
            type="text"
            id="twitter"
            {...register("social.twitter", {
              required: "twitter is required",
            })}
          />
          <p className="error">
            {errors.social && errors.social.twitter?.message}
          </p>

          <label htmlFor="facebook">facebook</label>
          <input
            type="text"
            id="facebook"
            {...register("social.facebook", {
              required: "facebook is required",
            })}
          />
          <p className="error">
            {errors.social && errors.social.facebook?.message}
          </p>

          <label htmlFor="primary-phone">primary phone</label>
          <input
            type="text"
            id="primary-phone"
            {...register("phoneNumbers.0", {
              required: "primary phone is required",
            })}
          />
          <p className="error">
            {errors.phoneNumbers && errors.phoneNumbers[0]?.message}
          </p>

          <label htmlFor="secondary-phone">secondary phone</label>
          <input
            type="text"
            id="secondary-phone"
            {...register("phoneNumbers.1", {
              required: "secondary phone is required",
            })}
          />
          <p className="error">
            {errors.phoneNumbers && errors.phoneNumbers[1]?.message}
          </p>

          <label htmlFor="ph-numbers">ph numbers</label>
          {fields.map((field, index) => (
            <div key={field.id}>
              <label>ph number {index + 1}</label>
              <input
                type="text"
                {...register(`phNumbers.${index}.number` as const)}
              />
              {index > 0 && (
                <button type="button" onClick={() => remove(index)}>
                  X
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => append({ number: "" })}>
            add more number
          </button>
          <br />
          <br />
          <button>submit</button>
        </form>
      </div>
      <DevTool control={control} />
    </>
  )
}
