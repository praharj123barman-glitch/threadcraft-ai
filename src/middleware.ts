export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/generate/:path*", "/history/:path*"],
};
