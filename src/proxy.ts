import { withAuth } from "next-auth/middleware";

export const proxy = withAuth({
    callbacks: {
        authorized: ({ token }) => !!token,
    },
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth API routes)
         * - auth (login/signup pages)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/auth|api/test-db|auth|_next/static|_next/image|favicon.ico).*)",
    ],
};
