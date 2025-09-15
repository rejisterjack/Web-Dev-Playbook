import data from '../data.json'

export async function GET() {
  return Response.json(data.users)
}

export async function POST(request: Request) {
  const reqDdata = await request.json()
  const newUser = {
    id: data.users.length + 1,
    name: reqDdata.name,
    age: reqDdata.age,
  }
  data.users.push(newUser)
  return new Response(JSON.stringify(newUser),{
    headers: {"Content-Type": "application/json"},
    status: 201
  })
}
