import prisma from "../db/prisma.js";

class UserService {
  updateUserRole(userId, role) {
    return prisma.user.update({
      where: { id: userId },
      data: { role: role },
    });
  }

  async getUserRole(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        return null;
      }

      return user.role;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du rôle de l'utilisateur:",
        error
      );
      throw new Error("Impossible de récupérer le rôle de l'utilisateur");
    }
  }
}

const userService = new UserService();

export default userService;
