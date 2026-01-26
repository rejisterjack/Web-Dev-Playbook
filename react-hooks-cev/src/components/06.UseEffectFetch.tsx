import { useEffect, useState } from "react"

const url = "https://jsonplaceholder.typicode.com/posts"

interface Post {
  title: string
  body: string
}

const UseEffectFetch = () => {
  const [post, setPost] = useState<Post>()
  const [id, setId] = useState("")
  const [fetchPost, setFetchPost] = useState(false)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!fetchPost) return
    setLoading(true)
    fetch(`${url}/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setPost(data)
        setFetchPost(false)
      }).finally(() => setLoading(false))
  }, [fetchPost, id])
  return (
    <div>
      <input type="text" className="form-control" onChange={(e) => setId(e.target.value)} />
      <button
        className="btn btn-primary my-2"
        onClick={() => setFetchPost(true)}
      >Fetch Post</button>
      <div>
        {loading ?
          <h2>Loading...</h2> :
          <>
            <h2>{post?.title}</h2>
            <p>{post?.body}</p>
          </>}
      </div>

    </div>
  )
}

export default UseEffectFetch