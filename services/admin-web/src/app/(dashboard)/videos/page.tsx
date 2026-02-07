"use client";

import { useState } from "react";
import { Video, Upload, Trash2, Plus, Film, Clock, HardDrive } from "lucide-react";
import { useVideos, useDriveVideos, useAddVideo, useRemoveVideo } from "@/hooks/use-library";
import { Video as VideoType } from "@/lib/schemas/library";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default function VideosPage() {
  const [showImportModal, setShowImportModal] = useState(false);
  const { data: videos, isLoading: isLoadingLibrary } = useVideos();
  const { data: driveVideos, isLoading: isLoadingDrive } = useDriveVideos();
  const addVideo = useAddVideo();
  const removeVideo = useRemoveVideo();

  const handleImportVideo = async (driveFile: {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    videoMediaMetadata?: { durationMillis?: string };
  }) => {
    const now = new Date().toISOString();
    const durationMs = driveFile.videoMediaMetadata?.durationMillis;
    const durationSeconds = durationMs ? parseInt(durationMs, 10) / 1000 : 0;

    const video: VideoType = {
      id: crypto.randomUUID(),
      title: driveFile.name.replace(/\.[^/.]+$/, ""), // Remove extension
      duration: durationSeconds,
      format: driveFile.mimeType,
      drive_file_id: driveFile.id,
      thumbnail_url: null,
      created_at: now,
      updated_at: now,
    };

    await addVideo.mutateAsync(video);
    setShowImportModal(false);
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (confirm("Are you sure you want to remove this video from your library?")) {
      await removeVideo.mutateAsync(videoId);
    }
  };

  // Filter out already imported videos from drive list
  const importedDriveIds = new Set(videos?.map((v) => v.drive_file_id) || []);
  const availableDriveVideos = driveVideos?.filter((v) => !importedDriveIds.has(v.id)) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Videos</h1>
          <p className="text-slate-600 mt-1">Manage your video library</p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Import from Drive
        </button>
      </div>

      {isLoadingLibrary ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden group"
            >
              <div className="aspect-video bg-slate-100 flex items-center justify-center">
                <Film className="w-12 h-12 text-slate-300" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 truncate" title={video.title}>
                  {video.title}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {video.duration > 0 ? formatDuration(video.duration) : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-400">{video.format}</span>
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove from library"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No videos yet</h2>
          <p className="text-slate-600 mb-4 max-w-md mx-auto">
            Import videos from your Google Drive to start building your streaming library.
          </p>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import from Drive
          </button>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Import from Google Drive</h2>
              <p className="text-slate-600 mt-1">Select videos from your Drive to add to your library</p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {isLoadingDrive ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
                </div>
              ) : availableDriveVideos.length > 0 ? (
                <div className="space-y-2">
                  {availableDriveVideos.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleImportVideo(file)}
                      disabled={addVideo.isPending}
                      className="w-full flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                        <Film className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 truncate">{file.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          {file.videoMediaMetadata?.durationMillis && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(parseInt(file.videoMediaMetadata.durationMillis, 10) / 1000)}
                            </span>
                          )}
                          {file.size && (
                            <span className="flex items-center gap-1">
                              <HardDrive className="w-3 h-3" />
                              {formatFileSize(parseInt(file.size, 10))}
                            </span>
                          )}
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-slate-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HardDrive className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No videos found in your Google Drive</p>
                  <p className="text-slate-500 text-sm mt-1">
                    Upload videos to your Drive first, then import them here
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowImportModal(false)}
                className="w-full py-2 text-slate-700 hover:text-slate-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
