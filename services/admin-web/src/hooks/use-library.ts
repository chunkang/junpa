"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { GoogleDriveClient } from "@/lib/google-drive";
import { Library, Video, Playlist } from "@/lib/schemas/library";

function useDriveClient() {
  const { data: session } = useSession();

  if (!session?.accessToken) {
    return null;
  }

  return new GoogleDriveClient(session.accessToken);
}

export function useLibrary() {
  const client = useDriveClient();

  return useQuery({
    queryKey: ["library"],
    queryFn: async () => {
      if (!client) throw new Error("Not authenticated");
      return client.getLibrary();
    },
    enabled: !!client,
  });
}

export function useVideos() {
  const { data: library, ...rest } = useLibrary();
  return {
    data: library?.videos,
    ...rest,
  };
}

export function usePlaylists() {
  const { data: library, ...rest } = useLibrary();
  return {
    data: library?.playlists,
    ...rest,
  };
}

export function useAddVideo() {
  const queryClient = useQueryClient();
  const client = useDriveClient();

  return useMutation({
    mutationFn: async (video: Video) => {
      if (!client) throw new Error("Not authenticated");

      const library = await client.getLibrary();
      const updatedLibrary: Library = {
        ...library,
        videos: [...library.videos, video],
      };
      await client.saveLibrary(updatedLibrary);
      return updatedLibrary;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["library"], data);
    },
  });
}

export function useRemoveVideo() {
  const queryClient = useQueryClient();
  const client = useDriveClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!client) throw new Error("Not authenticated");

      const library = await client.getLibrary();
      const updatedLibrary: Library = {
        ...library,
        videos: library.videos.filter((v) => v.id !== videoId),
        // Also remove from playlists
        playlists: library.playlists.map((p) => ({
          ...p,
          items: p.items.filter((i) => i.video_id !== videoId),
        })),
      };
      await client.saveLibrary(updatedLibrary);
      return updatedLibrary;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["library"], data);
    },
  });
}

export function useAddPlaylist() {
  const queryClient = useQueryClient();
  const client = useDriveClient();

  return useMutation({
    mutationFn: async (playlist: Playlist) => {
      if (!client) throw new Error("Not authenticated");

      const library = await client.getLibrary();
      const updatedLibrary: Library = {
        ...library,
        playlists: [...library.playlists, playlist],
      };
      await client.saveLibrary(updatedLibrary);
      return updatedLibrary;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["library"], data);
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();
  const client = useDriveClient();

  return useMutation({
    mutationFn: async (playlist: Playlist) => {
      if (!client) throw new Error("Not authenticated");

      const library = await client.getLibrary();
      const updatedLibrary: Library = {
        ...library,
        playlists: library.playlists.map((p) =>
          p.id === playlist.id ? playlist : p
        ),
      };
      await client.saveLibrary(updatedLibrary);
      return updatedLibrary;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["library"], data);
    },
  });
}

export function useRemovePlaylist() {
  const queryClient = useQueryClient();
  const client = useDriveClient();

  return useMutation({
    mutationFn: async (playlistId: string) => {
      if (!client) throw new Error("Not authenticated");

      const library = await client.getLibrary();
      const updatedLibrary: Library = {
        ...library,
        playlists: library.playlists.filter((p) => p.id !== playlistId),
      };
      await client.saveLibrary(updatedLibrary);
      return updatedLibrary;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["library"], data);
    },
  });
}

export function useDriveVideos() {
  const client = useDriveClient();

  return useQuery({
    queryKey: ["drive-videos"],
    queryFn: async () => {
      if (!client) throw new Error("Not authenticated");
      return client.listVideos();
    },
    enabled: !!client,
  });
}

export function useUploadVideo() {
  const queryClient = useQueryClient();
  const client = useDriveClient();

  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      if (!client) throw new Error("Not authenticated");
      return client.uploadVideo(file, onProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drive-videos"] });
    },
  });
}
