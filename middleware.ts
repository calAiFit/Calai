// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)", // бүх route-д Clerk шалгалт хийх
    "/", // үндсэн хуудас
    "/(api|trpc)(.*)", // API route-ууд
  ],
};
