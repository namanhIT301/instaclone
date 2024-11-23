import { cn } from "@/lib/utils";

function ViewPost({ className }: { className?: string }) {
  return (
    <div className={cn("flex p-3", className)}>
      <button
        onClick={() => window.location.reload()}
        className="text-sky-500 hover:text-sky-700 font-semibold text-sm"
      >
        Xem bài viết
      </button>
    </div>
  );
}

export default ViewPost;
