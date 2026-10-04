declare module "@vercel/blob" {
  export function put(
    path: string,
    file: Blob | File,
    options?: {
      access?: "public" | "private";
      contentType?: string;
      addRandomSuffix?: boolean;
      [key: string]: unknown;
    },
  ): Promise<{ url: string }>;
}
