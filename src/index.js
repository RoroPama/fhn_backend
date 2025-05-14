import prisma from "./db/prisma.js";

async function main() {
  await prisma.user.create({
    data: {
      name: "John Doe",
      email: "example@example.com",
      mot_de_passe_hash: "123654789",
      role: "parent",
    },
  });

  const newUser = await prisma.user.findMany({});

  console.log(newUser);
}
