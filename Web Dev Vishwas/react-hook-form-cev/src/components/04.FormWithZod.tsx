import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface FormData {
  username: string
  email: string
  channel: string
}

const schema = z.object({
  username: z.string().nonempty("Username is required"),
  email: z
    .string()
    .nonempty("Email is required")
    .email("Email format is not valid"),
  channel: z.string().nonempty("Channel is required"),
})

const FormWithZod: React.FC = () => {
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
    resolver: zodResolver(schema),
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
            <span className="text-danger">{errors.username?.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="block mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register("email")}
            className="form-control"
          />
          {errors.email && (
            <span className="text-danger">{errors.email?.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="channel" className="block mb-2">
            Channel
          </label>
          <input
            type="text"
            id="channel"
            {...register("channel")}
            className="form-control"
          />
          {errors.channel && (
            <span className="text-danger">{errors.channel?.message}</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-sm mt-4">
          Submit
        </button>
      </form>
    </div>
  )
}

export default FormWithZod
