import data from '../../data.json'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userData = data.users.find((item) => item.id === parseInt(id))
  return Response.json(userData)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const userIndex = data.users.findIndex((item) => item.id === parseInt(id))
  data.users[userIndex] = { ...data.users[userIndex], ...body }
  return Response.json(data.users[userIndex])
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userIndex = data.users.findIndex((item) => item.id === parseInt(id))
  const deletedUser = data.users.splice(userIndex, 1)[0]
  return Response.json({
    message: 'User deleted successfully',
    user: deletedUser,
  })
}
