import { FormEvent, useState } from "react"
import {
  useAddContactMutation,
  useDeleteContactMutation,
  useGetContactQuery,
  useGetContactsQuery,
  useUpdateContactMutation,
} from "./services/contactServices"

function App() {
  const { data } = useGetContactsQuery()
  return (
    <>
      <div className="d-flex flex-row-reverse w-100 gap-2 p-2">
        <div className="w-50">
          <h4>Contacts with RTK Query</h4>
          <h5>all contacts data</h5>
          <ul>
            {data?.map((item) => (
              <li key={item.id}>
                {item.name} <br />
                <Contact id={item.id} />
              </li>
            ))}
          </ul>
        </div>
        <div className="w-50">
          <h4>Add new Contact</h4>
          <AddContact />
          <br />
          <h4>Delete Contact</h4>
          <DeleteContact />
          <br />
          <h4>Update Contact</h4>
          <UpdateContact />
        </div>
      </div>
    </>
  )
}

function Contact({ id }: { id: number }) {
  const { data } = useGetContactQuery(id)
  return (
    <>
      <pre>{JSON.stringify(data, undefined, 2)}</pre>
    </>
  )
}

function AddContact() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [addContact] = useAddContactMutation()
  // const {refetch} = useGetContactsQuery()
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newContact = {
      id: ~~(Math.random() * 1000),
      name,
      email,
    }
    await addContact(newContact)
    // refetch()

    setName("")
    setEmail("")
  }
  return (
    <>
      <form onSubmit={handleSubmit} className="border border-1 rounded p-2">
        <h5>name</h5>
        <input
          className="form-control"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <h5>email</h5>
        <input
          className="form-control"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <button type="submit" className="btn btn-primary">
          add contact
        </button>
      </form>
    </>
  )
}

function DeleteContact() {
  const [id, setId] = useState<number | string>("")
  const [deleteContact] = useDeleteContactMutation()
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await deleteContact(+id)
    setId("")
  }
  return (
    <>
      <form onSubmit={handleSubmit} className="border border-1 rounded p-2">
        <h5>contact id</h5>
        <input
          type="text"
          className="form-control"
          value={id}
          onChange={(e) => setId(+e.target.value)}
        />
        <br />
        <button type="submit" className="btn btn-danger">
          delete contact
        </button>
      </form>
    </>
  )
}

function UpdateContact() {
  const [id, setId] = useState<number | string>("")
  const [updateType, setUpdateType] = useState("")
  const [updatedValue, setUpdatedValue] = useState("")
  const [updateContact] = useUpdateContactMutation()
  const { data: contactData } = useGetContactQuery(+id)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newContact = {
      id,
      ...contactData,
      [updateType]: updatedValue,
    }
    await updateContact(newContact)
    setUpdatedValue("")
  }
  return (
    <>
      <form onSubmit={handleSubmit} className="border border-1 rounded p-2">
        <h5>contact id</h5>
        <input
          type="text"
          className="form-control"
          value={+id}
          onChange={(e) => setId(+e.target.value)}
        />
        <br />
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={updateType}
            onChange={(e) => setUpdateType(e.target.value)}
          >
            <option defaultChecked>select type</option>
            <option value={"name"}>name</option>
            <option value={"email"}>email</option>
          </select>
          <input
            type="text"
            className="form-control"
            value={updatedValue}
            onChange={(e) => setUpdatedValue(e.target.value)}
          />
        </div>
        <br />
        <button type="submit" className="btn btn-warning">
          update contact
        </button>
      </form>
    </>
  )
}

export default App
