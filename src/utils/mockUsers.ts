interface User {
  userId: string;
  password: string;
  name: string;
  darkMode?: boolean;
}

// Mock users with their 4-digit IDs and 6 or 8-digit passwords
export const mockUsers: User[] = [
  {
    userId: "3694",
    password: "369400",
    name: "Administrator",
    darkMode: true, // Administrator prefers dark mode
  },
  {
    userId: "3119",
    password: "11223344",
    name: "Filipe Silva",
    darkMode: false, // João prefers light mode
  },
  {
    userId: "5678",
    password: "567890",
    name: "Maria Santos",
    darkMode: false,
  },
  {
    userId: "9012",
    password: "901234",
    name: "Pedro Costa",
    darkMode: false,
  },
  {
    userId: "1111",
    password: "11223344",
    name: "Test User",
    darkMode: false,
  },
];

export const authenticateUser = (
  userId: string,
  password: string
): User | null => {
  const user = mockUsers.find(
    (u) => u.userId === userId && u.password === password
  );
  return user ? { ...user } : null;
};
