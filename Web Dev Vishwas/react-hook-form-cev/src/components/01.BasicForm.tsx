const BasicForm = () => {
  return (
    <div>
      <form>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input type="text" className="form-control" id="username" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" className="form-control" id="email" />
        </div>
        <div className="form-group">
          <label htmlFor="channel">Channel</label>
          <input type="text" className="form-control" id="channel" />
        </div>
        <button type="submit" className="btn btn-primary mt-2">
          Submit
        </button>
      </form>
    </div>
  )
}

export default BasicForm
