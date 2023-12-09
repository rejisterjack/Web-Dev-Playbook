import { useForm } from "react-hook-form"
import { DevTool } from "@hookform/devtools"

type FormValues = {
  username: string
  email: string
  channel: string
  age: number
  dob: Date
}

export default function FormStates() {
  const {
    register,
    control,
    handleSubmit,
    formState,
    watch,
    getValues,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      username: "",
      email: "",
      channel: "",
      age: 0,
      dob: new Date(),
    },
  })
  const { errors, touchedFields, dirtyFields } = formState

  console.log(errors, touchedFields, dirtyFields)

  const onSubmit = (data: FormValues) => {
    console.log(data)
  }

  //FIXME: watch specific
  const myName = watch("username")

  //FIXME: watch multiple
  // const myName = watch(["username", "email"])

  //FIXME: watch all
  // const myName = watch()

  // FIXME: for all
  const handleGetValues = () => console.log(getValues())

  // FIXME: for multiple
  // const handleGetValues = () => console.log(getValues(["username", "email"]))

  // FIXME: for specific
  // const handleGetValues = () => console.log(getValues("username"))

  const handleSetValues = () => {
    setValue("username", "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  return (
    <>
      <div>
        <h4>{myName}</h4>
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

          <button type="button" onClick={handleGetValues}>
            get values
          </button>
          <br />
          <br />
          <button type="button" onClick={handleSetValues}>
            set username
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
