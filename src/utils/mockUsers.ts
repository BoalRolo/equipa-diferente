interface User {
  userId: string;
  password: string;
  name: string;
  darkMode?: boolean;
  xrayAccountId?: string; // Xray/Jira account ID (e.g., "712020:7351335a-fbae-470f-aca6-6bb415b1ec63")
}

// Mock users with their 4 or 6-digit IDs and 6 or 8-digit passwords
export const mockUsers: User[] = [
  {
    userId: "3694",
    password: "369400",
    name: "Administrator",
    darkMode: true,
    xrayAccountId: "712020:7351335a-fbae-470f-aca6-6bb415b1ec63",
  },
  {
    userId: "3119",
    password: "11223344",
    name: "Filipe Silva",
    darkMode: false, // João prefers light mode
  },
  {
    userId: "820159",
    password: "477455",
    name: "Mario Fonseca",
    darkMode: false,
  },
  {
    userId: "220529",
    password: "112233",
    name: "Edite Pontes",
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
