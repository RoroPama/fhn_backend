import prisma from "../db/prisma.js";

class UserService {
  updateUserRole(userId, role) {
    return prisma.user.update({
      where: { id: userId },
      data: { role: role },
    });
  }
}

const userService = new UserService();

export default userService;
