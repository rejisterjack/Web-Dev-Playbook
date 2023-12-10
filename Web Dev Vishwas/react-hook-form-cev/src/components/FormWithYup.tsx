import { useForm } from "react-hook-form"
import { DevTool } from "@hookform/devtools"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

type FormValues = {
  username: string
  email: string
  channel: string
}

const schema = yup.object({
  username: yup.string().required("username is required"),
  email: yup
    .string()
    .email("email format is not valid")
    .required("email is required"),
  channel: yup.string().required("channel is required"),
})

export default function FormWithYup() {
  const { register, control, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: {
      username: "",
      email: "",
      channel:""
    },
    resolver: yupResolver(schema),
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
          <input type="text" id="username" {...register("username", {})} />
          <p className="error">{errors.username?.message}</p>

          <label htmlFor="email">email</label>
          <input type="text" id="email" {...register("email", {})} />
          <p className="error">{errors.email?.message}</p>

          <label htmlFor="channel">channel</label>
          <input type="text" id="channel" {...register("channel", {})} />
          <p className="error">{errors.channel?.message}</p>

          <button>submit</button>
        </form>
      </div>
      <DevTool control={control} />
    </>
  )
}
