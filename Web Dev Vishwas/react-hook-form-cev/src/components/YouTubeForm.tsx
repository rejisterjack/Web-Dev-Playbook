import { useForm } from "react-hook-form"
import { DevTool } from "@hookform/devtools"

type FormValues = {
	username: string
	email: string
	channel: string
}

export default function YouTubeForm() {

	const { register, control, handleSubmit, formState } = useForm<FormValues>()
	const {errors} = formState

	// inside working
	// const { name, ref, onChange, onBlur } = register("username")

	const onSubmit = (data: FormValues) => {
		console.log(data)
	}

	return (
		<>
			<div>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>

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
							required: "username is required"
						})}
					/>
					<p className="error">{errors.username?.message}</p>

					<label htmlFor="email">email</label>
					<input
						type="text"
						id="email"
						{...register("email", {
							required:"email is required",
							pattern:{
							value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
								message: "invalid email format"
						}})}
					/>
					<p className="error">{errors.email?.message}</p>

					<label htmlFor="channel">channel</label>
					<input
						type="text"
						id="channel"
						{...register("channel", {
							required:"channel is required"
						})}
					/>
					<p className="error">{errors.channel?.message}</p>

					<button>submit</button>

				</form>
			</div>
			<DevTool control={control} />
		</>
	)
}