import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin', // URL trang đăng nhập
    error: '/auth/error', // URL trang lỗi
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Đảm bảo chỉ điều hướng về /dashboard nếu đó là URL mong muốn
      if (url === "/") {
        return baseUrl;
      }
      return url || baseUrl;
    },
  },
});
