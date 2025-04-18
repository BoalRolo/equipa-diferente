interface User {
  userId: string;
  password: string;
  name: string;
}

// Mock users with their 4-digit IDs and 6-digit passwords
export const mockUsers: User[] = [
  {
    userId: "3694",
    password: "369400",
    name: "Administrator",
  },
  {
    userId: "1234",
    password: "123456",
    name: "João Silva",
  },
  {
    userId: "5678",
    password: "567890",
    name: "Maria Santos",
  },
  {
    userId: "9012",
    password: "901234",
    name: "Pedro Costa",
  },
];

export const authenticateUser = (
  userId: string,
  password: string
): User | null => {
  const user = mockUsers.find(
    (u) => u.userId === userId && u.password === password
  );
  return user || null;
};
