import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import React from "react"
import { useForm } from "react-hook-form"

interface FormData {
  username: string
  email: string
  channel: string
}

const schema = yup.object({
  username: yup.string().required("Username is required"),
  email: yup
    .string()
    .email("Email format is not valid")
    .required("Email is required"),
  channel: yup.string().required("Channel is required"),
})

const FormWithYup: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      username: "",
      email: "",
      channel: "",
    },
    resolver: yupResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            {...register("username")}
            className="form-control"
          />
          {errors.username && (
            <span className="text-danger">This field is required</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="block mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register("email", { required: true })}
            className="form-control"
          />
          {errors.email && (
            <span className="text-danger">
              Please enter a valid email address
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="channel" className="block mb-2">
            Channel
          </label>
          <input
            type="text"
            id="channel"
            {...register("channel", { required: true })}
            className="form-control"
          />
          {errors.channel && (
            <span className="text-danger">This field is required</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-sm mt-4">
          Submit
        </button>
      </form>
    </div>
  )
}

export default FormWithYup
