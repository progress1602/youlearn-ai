// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Session {
  id: string;
  url: string;
  username: string;
  title: string | "";
  createdAt: string;
  fileType: string;
  isPending: boolean | false;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface JWTPayload {
  username?: string;
  [key: string]: string | number | boolean | null | undefined;
}