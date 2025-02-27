import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      id: "some-unique-id",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "USER",
    },
  })
  console.log(user)
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
