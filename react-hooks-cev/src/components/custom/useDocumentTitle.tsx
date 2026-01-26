import { useEffect } from "react"

const useDocumentTitle = (count: number) => {
  useEffect(() => {
    document.title = `Count ${count}`
  }, [count])
  return <div>useDocumentTitle</div>
}

export default useDocumentTitle
