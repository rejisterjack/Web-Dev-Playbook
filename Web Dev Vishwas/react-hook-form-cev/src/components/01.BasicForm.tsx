import { useForm } from "react-hook-form"
import { DevTool } from "@hookform/devtools"

type FormValues = {
  username: string
  email: string
  channel: string
}

const BasicForm = () => {
  const { register, handleSubmit, control } = useForm<FormValues>()

  const onSubmit = (data: FormValues) => {
    console.log(data)
  }
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            {...register("username")}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            {...register("email")}
          />
        </div>
        <div className="form-group">
          <label htmlFor="channel">Channel</label>
          <input
            type="text"
            className="form-control"
            id="channel"
            {...register("channel")}
          />
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
