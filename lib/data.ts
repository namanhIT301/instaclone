import { unstable_noStore as noStore } from "next/cache";
import prisma from "./prisma";

export async function fetchPosts() {
  noStore()


  try {
    const data = await prisma.post.findMany({
      include: {
        comments: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: "desc"
          }
        },
        likes: {
          include: {
            user: true
          }
        },
        savedBy: true,
        user: true
      },
      orderBy: {
        createdAt: "desc"
      }

    })

    return data
  } catch (error) {
    console.error("Lỗi Database:", error)
    throw new Error("Gửi yêu cầu POST thất bại")

  }
}

export async function fetchPostById(id: string) {
  noStore();

  try {
    const data = await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        likes: {
          include: {
            user: true,
          },
        },
        savedBy: true,
        user: true,
      },
    });

    return data;
  } catch (error) {
    console.error("Lỗi Database::", error);
    throw new Error("Gửi yêu cầu POST thất bại");
  }
}

export async function fetchPostsByUsername(username: string, postId?: string) {
  noStore();

  try {
    const data = await prisma.post.findMany({
      where: {
        user: {
          username,
        },
        NOT: {
          id: postId,
        },
      },
      include: {
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        likes: {
          include: {
            user: true,
          },
        },
        savedBy: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return data;
  } catch (error) {
    console.error("Lỗi Database::", error);
    throw new Error("Gửi yêu cầu POST thất bại");
  }
}

export async function fetchProfile(username: string) {
  noStore();

  try {
    const data = await prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        posts: {
          orderBy: {
            createdAt: "desc",
          },
        },
        saved: {
          orderBy: {
            createdAt: "desc",
          },
        },
        followedBy: {
          include: {
            follower: {
              include: {
                following: true,
                followedBy: true,
              },
            },
          },
        },
        following: {
          include: {
            following: {
              include: {
                following: true,
                followedBy: true,
              },
            },
          },
        },
      },
    });

    return data;
  } catch (error) {
    console.error("Lỗi Database:", error);
    throw new Error("Không thể lấy thông tin hồ sơ.");
  }
}
