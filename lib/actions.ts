"use server";

import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exportTraceState } from "next/dist/trace";
import { Delete } from "lucide-react";
import {
  BookmarkSchema,
  CreateComment,
  CreatePost,
  DeleteComment,
  DeletePost,
  FollowUser,
  LikeSchema,
  UpdatePost,
  UpdateUser,
} from "./schemas";

export async function createPost(values: z.infer<typeof CreatePost>) {
  const userId = await getUserId();

  const validatedFields = CreatePost.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Thiếu trường dữ liệu. Không thể tạo bài viết.",
    };
  }

  const { fileUrl, caption } = validatedFields.data;

  // Tạo logic của Post ở đây
  try {
    await prisma.post.create({
      data: {
        caption,
        fileUrl,
        user: {
          connect: {
            id: userId
          }

        }
      }

    })

  } catch (error) {
    return {
      message: "Lỗi Database: Không thể tạo được bài viết."
    };
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function deletePost(formData: FormData) {
  const userId = await getUserId();

  const { id } = DeletePost.parse({
    id: formData.get("id"),

  })

  const post = await prisma.post.findUnique({
    where: {
      id,
      userId
    }

  })
  if (!post) {
    throw new Error("Không tìm thấy bài viết.")
  }
  try {
    await prisma.post.delete({
      where: {
        id
      }
    })
    revalidatePath("/Dashboard");
    return { message: "Đã xoá bài viết." }
  } catch (error) {
    return { message: "Lỗi Database: Thất bại trong việc xoá bài viết" }
  }
}

export async function likePost(value: FormDataEntryValue | null) {
  const userId = await getUserId();

  const validatedFields = LikeSchema.safeParse({ postId: value })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Thiếu trường dữ liệu. Không thể thích bài viết.",
    };
  }

  const { postId } = validatedFields.data;

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Error("Không thấy bài viết.");
  }

  const like = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  if (like) {
    try {
      await prisma.like.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
      revalidatePath("/dashboard");
      return { message: "Đã bỏ thích bài viết." };
    } catch (error) {
      return { message: "Lỗi Database: Thất bại trong việc bỏ thích bài viết." };
    }
  }

  try {
    await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });
    revalidatePath("/dashboard");
    return { message: "Đã thích bài viết." }; //Liked Post.
  } catch (error) {
    return { message: "Lỗi Database: Thất bại trong việc thích bài viết." };
  }
}

export async function bookmarkPost(value: FormDataEntryValue | null) {
  const userId = await getUserId();

  const validatedFields = BookmarkSchema.safeParse({ postId: value });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Thiếu trường dữ liệu. Không thể đánh dấu bài viết.",
    };
  }

  const { postId } = validatedFields.data;

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Error("Không thấy bài viết.");
  }

  const bookmark = await prisma.savedPost.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  if (bookmark) {
    try {
      await prisma.savedPost.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
      revalidatePath("/dashboard");
      return { message: "Đã bỏ đánh dấu bài viết." };
    } catch (error) {
      return {
        message: "Lỗi Database: Thất bại trong việc bỏ đánh dấu bài viết.",
      };
    }
  }

  try {
    await prisma.savedPost.create({
      data: {
        postId,
        userId,
      },
    });
    revalidatePath("/dashboard");
    return { message: "Đã đánh dấu bài viết." };
  } catch (error) {
    return {
      message: "Lỗi Database: Thất bại trong việc bỏ đánh dấu bài viết.",
    };
  }
}

export async function createComment(values: z.infer<typeof CreateComment>) {
  const userId = await getUserId();

  const validatedFields = CreateComment.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Thiếu trường dữ liệu. Không thể bình luận.",
    };
  }

  const { postId, body } = validatedFields.data;

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Error("Không thấy bài viết.");
  }

  try {
    await prisma.comment.create({
      data: {
        body,
        postId,
        userId,
      },
    });
    revalidatePath("/dashboard");
    return { message: "Đã bình luận bài viết." };
  } catch (error) {
    return { message: "Lỗi Database: Thất bại trong việc bình luận bài viết." };
  }
}

export async function deleteComment(formData: FormData) {
  const userId = await getUserId();

  const { id } = DeleteComment.parse({
    id: formData.get("id"),
  });

  const comment = await prisma.comment.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!comment) {
    throw new Error("Không thấy bình luận.");
  }

  try {
    await prisma.comment.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard");
    return { message: "Đã xoá bình luận." };
  } catch (error) {
    return { message: "Lỗi Database: Thất bại trong việc xoá bình luận bài viết." };
  }
}

export async function updatePost(values: z.infer<typeof UpdatePost>) {
  const userId = await getUserId();

  const validatedFields = UpdatePost.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Thiếu trường dữ liệu. Không thể cập nhật bài viết.",
    };
  }

  const { id, fileUrl, caption } = validatedFields.data;

  const post = await prisma.post.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!post) {
    throw new Error("Không thấy bài viết.");
  }

  try {
    await prisma.post.update({
      where: {
        id,
      },
      data: {
        fileUrl,
        caption,
      },
    });
  } catch (error) {
    return { message: "Lỗi Database: Thất bại trong việc cập nhật bài viết." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProfile(values: z.infer<typeof UpdateUser>) {
  const userId = await getUserId();

  const validatedFields = UpdateUser.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Không thấy trường dữ liệu. Thất bại trong việc cập nhật bài viết.",
    };
  }

  const { bio, gender, image, name, username, website } = validatedFields.data;

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username,
        name,
        image,
        bio,
        gender,
        website,
      },
    });
    revalidatePath("/dashboard");
    return { message: "Đã cập nhật trang cá nhân." };
  } catch (error) {
    return { message: "Lỗi Database: Thất bại trong việc cập nhật trang cá nhân." };
  }
}

export async function followUser(formData: FormData) {
  const userId = await getUserId();

  const { id } = FollowUser.parse({
    id: formData.get("id"),
  });

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new Error("Không thấy người dùng.");
  }

  const follows = await prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        // followerId là của người muốn theo dõi
        followerId: userId,
        // followingId là của người đang được theo dõi
        followingId: id,
      },
    },
  });

  if (follows) {
    try {
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: id,
          },
        },
      });
      revalidatePath("/dashboard");
      return { message: "Đã huỷ theo dõi người dùng." };
    } catch (error) {
      return {
        message: "Lỗi Database: Thất bại trong việc huỷ theo dõi người dùng.",
      };
    }
  }

  try {
    await prisma.follows.create({
      data: {
        followerId: userId,
        followingId: id,
      },
    });
    revalidatePath("/dashboard");
    return { message: "Đã theo dõi người dùng." };
  } catch (error) {
    return {
      message: "Lỗi Database: Thất bại trong việc theo dõi người dùng.",
    };
  }
}

// o trang chu -fetchPosts