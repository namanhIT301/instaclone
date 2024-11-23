import { auth } from "@/auth";
import ProfileForm from "@/components/ProfileForm";
import { fetchProfile } from "@/lib/data";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Chỉnh sửa trang cá nhân",
  description: "Chỉnh sửa trang cá nhân",
};

async function EditProfile() {
  const session = await auth();
  const profile = await fetchProfile(session?.user.username!);

  if (!profile) {
    notFound();
  }

  return (
    <div className="px-12">
      <h1 className="text-2xl font-medium">Chỉnh sửa trang cá nhân</h1>

      <ProfileForm profile={profile} />
    </div>
  );
}

export default EditProfile;
