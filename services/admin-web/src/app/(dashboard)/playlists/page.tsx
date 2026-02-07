"use client";

import { useState } from "react";
import {
  ListVideo,
  Plus,
  Trash2,
  Clock,
  Film,
  Play,
  RefreshCw,
  CalendarClock,
} from "lucide-react";
import { usePlaylists, useVideos, useAddPlaylist, useUpdatePlaylist, useRemovePlaylist } from "@/hooks/use-library";
import { Playlist, PlaylistItem } from "@/lib/schemas/library";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function PlaylistsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const { data: playlists, isLoading: isLoadingPlaylists } = usePlaylists();
  const { data: videos } = useVideos();
  const addPlaylist = useAddPlaylist();
  const updatePlaylist = useUpdatePlaylist();
  const removePlaylist = useRemovePlaylist();

  const getVideoById = (id: string) => videos?.find((v) => v.id === id);

  const getTotalDuration = (playlist: Playlist) => {
    return playlist.items.reduce((total, item) => {
      const video = getVideoById(item.video_id);
      return total + (item.custom_duration ?? video?.duration ?? 0);
    }, 0);
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      await removePlaylist.mutateAsync(playlistId);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Playlists</h1>
          <p className="text-slate-600 mt-1">Create and manage video playlists</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {isLoadingPlaylists ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      ) : playlists && playlists.length > 0 ? (
        <div className="space-y-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {playlist.title}
                    </h3>
                    {playlist.loop && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                        <RefreshCw className="w-3 h-3" />
                        Loop
                      </span>
                    )}
                    {playlist.start_at && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                        <CalendarClock className="w-3 h-3" />
                        Scheduled
                      </span>
                    )}
                  </div>
                  {playlist.description && (
                    <p className="text-slate-600 mt-1">{playlist.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Film className="w-4 h-4" />
                      {playlist.items.length} videos
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(getTotalDuration(playlist))}
                    </span>
                    {playlist.start_at && (
                      <span className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        Starts {formatDateTime(playlist.start_at)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingPlaylist(playlist)}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlaylist(playlist.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Video list preview */}
              {playlist.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {playlist.items.slice(0, 5).map((item, index) => {
                      const video = getVideoById(item.video_id);
                      return (
                        <span
                          key={item.video_id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-sm rounded"
                        >
                          <span className="text-slate-400">{index + 1}.</span>
                          {video?.title || "Unknown video"}
                        </span>
                      );
                    })}
                    {playlist.items.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 text-slate-500 text-sm">
                        +{playlist.items.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ListVideo className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No playlists yet</h2>
          <p className="text-slate-600 mb-4 max-w-md mx-auto">
            Create playlists to organize your videos for streaming.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Playlist
          </button>
        </div>
      )}

      {/* Create/Edit Playlist Modal */}
      {(showCreateModal || editingPlaylist) && (
        <PlaylistModal
          playlist={editingPlaylist}
          videos={videos || []}
          onSave={async (playlist) => {
            if (editingPlaylist) {
              await updatePlaylist.mutateAsync(playlist);
            } else {
              await addPlaylist.mutateAsync(playlist);
            }
            setShowCreateModal(false);
            setEditingPlaylist(null);
          }}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPlaylist(null);
          }}
          isLoading={addPlaylist.isPending || updatePlaylist.isPending}
        />
      )}
    </div>
  );
}

interface PlaylistModalProps {
  playlist: Playlist | null;
  videos: { id: string; title: string; duration: number }[];
  onSave: (playlist: Playlist) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

function PlaylistModal({ playlist, videos, onSave, onClose, isLoading }: PlaylistModalProps) {
  const [title, setTitle] = useState(playlist?.title || "");
  const [description, setDescription] = useState(playlist?.description || "");
  const [loop, setLoop] = useState(playlist?.loop || false);
  const [startAt, setStartAt] = useState(playlist?.start_at?.slice(0, 16) || "");
  const [items, setItems] = useState<PlaylistItem[]>(playlist?.items || []);

  const handleAddVideo = (videoId: string) => {
    setItems([
      ...items,
      { video_id: videoId, order: items.length, custom_duration: null },
    ]);
  };

  const handleRemoveVideo = (index: number) => {
    setItems(items.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })));
  };

  const handleMoveVideo = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);
    setItems(newItems.map((item, i) => ({ ...item, order: i })));
  };

  const handleSave = async () => {
    const now = new Date().toISOString();
    const newPlaylist: Playlist = {
      id: playlist?.id || crypto.randomUUID(),
      title,
      description: description || null,
      items,
      loop,
      start_at: startAt ? new Date(startAt).toISOString() : null,
      created_at: playlist?.created_at || now,
      updated_at: now,
    };
    await onSave(newPlaylist);
  };

  const availableVideos = videos.filter((v) => !items.some((i) => i.video_id === v.id));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {playlist ? "Edit Playlist" : "Create Playlist"}
          </h2>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="My Playlist"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
              placeholder="A brief description..."
            />
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
                className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
              />
              <span className="text-sm text-slate-700">Loop playlist</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-700">Start at:</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="px-2 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Videos in playlist */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Videos ({items.length})
            </label>
            {items.length > 0 ? (
              <div className="space-y-2 mb-4">
                {items.map((item, index) => {
                  const video = videos.find((v) => v.id === item.video_id);
                  return (
                    <div
                      key={item.video_id}
                      className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveVideo(index, index - 1)}
                          disabled={index === 0}
                          className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleMoveVideo(index, index + 1)}
                          disabled={index === items.length - 1}
                          className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      <span className="text-slate-400 text-sm w-6">{index + 1}.</span>
                      <span className="flex-1 text-slate-900">{video?.title || "Unknown"}</span>
                      <span className="text-slate-500 text-sm">
                        {video ? formatDuration(video.duration) : "--:--"}
                      </span>
                      <button
                        onClick={() => handleRemoveVideo(index)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-sm mb-4">No videos added yet</p>
            )}

            {/* Add video dropdown */}
            {availableVideos.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddVideo(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-600"
                defaultValue=""
              >
                <option value="" disabled>
                  + Add a video...
                </option>
                {availableVideos.map((video) => (
                  <option key={video.id} value={video.id}>
                    {video.title} ({formatDuration(video.duration)})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || isLoading}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : playlist ? "Update Playlist" : "Create Playlist"}
          </button>
        </div>
      </div>
    </div>
  );
}
