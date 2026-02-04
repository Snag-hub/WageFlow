import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            companyId: string;
            companyName: string;
        } & DefaultSession["user"]
    }

    interface User {
        id: string;
        companyId: string;
        companyName: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        companyId: string;
        companyName: string;
    }
}
