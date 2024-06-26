import { useForm, useFieldArray } from "react-hook-form"
import { DevTool } from "@hookform/devtools"

type FormValues = {
  username: string
  email: string
  channel: string
  social: {
    facebook: string
    twitter: string
  }
  phoneNumbers: string[]
  phNumbers?: {
    number: string
    key: number
  }[]
  age: number
  dob: Date
}

const EnhancedForm = () => {
  const { register, handleSubmit, control, formState, watch } = useForm<FormValues>({
    // normal values
    defaultValues: {
      username: "John Doe",
      email: "",
      channel: "",
      social: {
        facebook: "",
        twitter: "",
      },
      phoneNumbers: ["", ""],
      phNumbers: [{ number: "", key: 0 }],
      age: 0,
      dob: new Date(),
    },

    // async values
    // defaultValues: async () => {
    //   const response = await fetch("https://jsonplaceholder.typicode.com/users/1")
    //   const data = await response.json()
    //   return data
    // }
  })

  const { fields, append, remove } = useFieldArray({
    name: "phNumbers",
    control,
  })

  const onSubmit = (data: FormValues) => {
    console.log(data)
  }
  return (
    <div className="container">
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
                notAdmin: (value) =>
                  value !== "admin@example.com" || "Admin is not allowed",
                notBlacklisted: (value) =>
                  !value.endsWith("example.com") || "Domain is not allowed",
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
        <div className="form-group">
          <label htmlFor="facebook">Facebook</label>
          <input
            type="text"
            className="form-control"
            id="facebook"
            {...register("social.facebook")}
          />
        </div>
        <div className="form-group">
          <label htmlFor="twitter">Twitter</label>
          <input
            type="text"
            className="form-control"
            id="twitter"
            {...register("social.twitter")}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumbers">Phone Number 1</label>
          <input
            type="text"
            className="form-control"
            id="phoneNumbers"
            {...register("phoneNumbers.0")}
          />
          <label htmlFor="phoneNumbers">Phone Number 2</label>
          <input
            type="text"
            className="form-control"
            id="phoneNumbers"
            {...register("phoneNumbers.1")}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phNumbers">List of Phone Numbers</label>
          {fields.map((field, index) => (
            <div key={field.id}>
              <input
                type="text"
                className="form-control"
                {...register(`phNumbers.${index}.number` as const)}
              />
              {index > 0 && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => remove(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-primary btn-sm mt-2"
            onClick={() => {
              append({ number: "", key: fields.length })
            }}
          >
            Add Phone Number
          </button>
        </div>
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            className="form-control"
            id="age"
            {...register("age", {
              valueAsNumber: true,
              required: "Age is required",
              min: {
                value: 18,
                message: "Minimum age is 18",
              },
            })}
          />
          <span>{formState.errors.age?.message}</span>
        </div>
        <div className="form-group">
          <label htmlFor="dob">Date of Birth</label>
          <input
            type="date"
            className="form-control"
            id="dob"
            {...register("dob", {
              required: "Date of Birth is required",
              valueAsDate: true,
              validate: {
                pastDate: (value) =>
                  new Date(value) < new Date() || "Invalid date",
              },
            })}
          />
          <span>{formState.errors.dob?.message}</span>
        </div>
        <button type="submit" className="btn btn-primary my-2">
          Submit
        </button>
      </form>
      <DevTool control={control} />
    </div>
  )
}

export default EnhancedForm
