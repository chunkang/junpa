"use client";

import { useSession } from "next-auth/react";
import { User, HardDrive, Shield } from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <User className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Account</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4">
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="text-lg font-medium text-slate-900">{session?.user?.name}</p>
                <p className="text-slate-600">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Google Drive Section */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Google Drive</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Connected Account</p>
                <p className="text-sm text-slate-600 mt-1">
                  Your videos are stored in your Google Drive under the .junpa folder.
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-full">
                Connected
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Junpa uses Google Drive to store your video library metadata. Your videos remain
                in their original location and are streamed directly from Google Drive.
              </p>
            </div>
          </div>
        </section>

        {/* Permissions Section */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <Shield className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Permissions</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">View and manage files</p>
                  <p className="text-slate-600">Access to files created by this app in your Drive</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Application data folder</p>
                  <p className="text-slate-600">Hidden app-specific storage for configuration</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-xl border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 flex items-center gap-3">
            <span className="text-lg font-semibold text-red-600">Danger Zone</span>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Delete Library Data</p>
                <p className="text-sm text-slate-600 mt-1">
                  Remove all playlists and video references. This will not delete your actual videos from Google Drive.
                </p>
              </div>
              <button className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                Delete Data
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
