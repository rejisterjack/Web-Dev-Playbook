import { useForm, useFieldArray, FieldErrors } from "react-hook-form"
import { DevTool } from "@hookform/devtools"
// import { useEffect } from "react"

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
  const {
    register,
    handleSubmit,
    control,
    formState,
    watch,
    setValue,
    getValues,
    reset,
  } = useForm<FormValues>({
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

  // watch specific fields
  // const watchAge = watch("age")
  // const watchMultipleFields = watch(["username", "email", "age"])
  // const watchEntireForm = watch()
  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) => {
  //     console.log(value, name, type)
  //   })
  //   return () => subscription.unsubscribe()
  // }, [watch])

  const handleSetValue = () => {
    // setValue("age", 0)
    setValue("age", 0, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const handleGetValues = () => {
    const values = getValues()
    console.log(values)
  }

  const onSubmit = (data: FormValues) => {
    console.log(data)
    formState.isSubmitSuccessful && reset()
  }

  const onError = (errors: FieldErrors<FormValues>) => {
    console.log("form errors: ", errors)
  }
  return (
    <div className="container">
      {/* {JSON.stringify(watchEntireForm)} */}
      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
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
          <span className="text-danger">
            {formState.errors.username?.message}
          </span>
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
          <span className="text-danger">{formState.errors.email?.message}</span>
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
          <span className="text-danger">
            {formState.errors.channel?.message}
          </span>
        </div>
        <div className="form-group">
          <label htmlFor="facebook">Facebook</label>
          <input
            type="text"
            className="form-control"
            id="facebook"
            {...register("social.facebook", {
              required: "Facebook is required",
              disabled: watch("channel") === "",
            })}
          />
          <span className="text-danger">
            {formState.errors.social?.facebook?.message}
          </span>
        </div>
        <div className="form-group">
          <label htmlFor="twitter">Twitter</label>
          <input
            type="text"
            className="form-control"
            id="twitter"
            {...register("social.twitter", {
              required: "Twitter is required",
              disabled: watch("channel") === "",
            })}
          />
          <span className="text-danger">
            {formState.errors.social?.twitter?.message}
          </span>
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
          <button
            className="btn btn-primary btn-sm mx-2 mt-2"
            onClick={handleSetValue}
          >
            set age
          </button>
          <button
            className="btn btn-primary btn-sm mt-2"
            onClick={handleGetValues}
          >
            get values
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
          <span className="text-danger">{formState.errors.age?.message}</span>
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
          <span className="text-danger">{formState.errors.dob?.message}</span>
        </div>
        <button
          disabled={!formState.isDirty || !formState.isValid}
          type="submit"
          className="btn btn-primary my-2"
        >
          Submit
        </button>
      </form>
      <DevTool control={control} />
    </div>
  )
}

export default EnhancedForm
