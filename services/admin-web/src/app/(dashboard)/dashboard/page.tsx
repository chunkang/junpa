import { auth } from "@/lib/auth";
import { Video, ListVideo, Star, Upload } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-slate-600 mt-1">
          Manage your video content and playlists
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Videos"
          value="0"
          icon={<Video className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Playlists"
          value="0"
          icon={<ListVideo className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Featured"
          value="0"
          icon={<Star className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Uploads Today"
          value="0"
          icon={<Upload className="w-5 h-5" />}
          color="green"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Get started with your first video
        </h2>
        <p className="text-slate-600 mb-4 max-w-md mx-auto">
          Upload videos from your computer or import from Google Photos to start
          building your streaming library.
        </p>
        <a
          href="/videos"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Video
        </a>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "purple" | "amber" | "green";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        <span className="text-slate-600 font-medium">{title}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
