interface User {
  username: string;
  password: string;
}

const mockUsers: User[] = [
  { username: "admin", password: "admin" },
  { username: "user", password: "user" },
];

export function authenticateUser(username: string, password: string): boolean {
  return mockUsers.some(
    (user) => user.username === username && user.password === password
  );
}
