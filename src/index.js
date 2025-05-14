import prisma from "./db/prisma.js";

async function main() {
  try {
    await prisma.user.create({
      data: {
        nom: "John Doe",
        email: "example@example.com",
        mot_de_passe_hash: "123654789",
        role: "parent",
      },
    });

    const newUser = await prisma.user.findMany({});
    console.log(newUser);
  } catch (error) {
    console.error("Une erreur s'est produite:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Erreur fatale:", error);
  process.exit(1);
});
