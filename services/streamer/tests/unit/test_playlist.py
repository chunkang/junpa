"""Tests for playlist position calculation."""

from datetime import UTC, datetime, timedelta

import pytest

from junpa_streamer.models.playlist import Playlist, PlaylistItem
from junpa_streamer.services.playlist import calculate_live_position


class TestCalculateLivePosition:
    """Tests for the calculate_live_position function."""

    def test_position_at_start(self, sample_playlist: Playlist) -> None:
        """Test position calculation at playlist start."""
        now = sample_playlist.start_at
        state = calculate_live_position(sample_playlist, now)

        assert state.video_index == 0
        assert state.video_id == "video-001"
        assert state.position == 0.0
        assert state.ended is False

    def test_position_mid_first_video(self, sample_playlist: Playlist) -> None:
        """Test position calculation in middle of first video."""
        now = sample_playlist.start_at + timedelta(seconds=150)  # 2.5 minutes in
        state = calculate_live_position(sample_playlist, now)

        assert state.video_index == 0
        assert state.video_id == "video-001"
        assert state.position == 150.0
        assert state.time_until_next == 150.0  # 5 min video, 2.5 min left
        assert state.ended is False

    def test_position_second_video(self, sample_playlist: Playlist) -> None:
        """Test position calculation in second video."""
        # First video is 5 minutes (300s), check at 7 minutes (420s)
        now = sample_playlist.start_at + timedelta(seconds=420)
        state = calculate_live_position(sample_playlist, now)

        assert state.video_index == 1
        assert state.video_id == "video-002"
        assert state.position == 120.0  # 420 - 300 = 120s into second video
        assert state.ended is False

    def test_position_with_loop(self, sample_playlist: Playlist) -> None:
        """Test position calculation when playlist loops."""
        # Playlist is 15 minutes (900s), check at 20 minutes (1200s)
        # Should loop to 1200 % 900 = 300s (start of second video)
        now = sample_playlist.start_at + timedelta(seconds=1200)
        state = calculate_live_position(sample_playlist, now)

        assert state.video_index == 1
        assert state.video_id == "video-002"
        assert state.position == 0.0  # Exactly at start of second video
        assert state.ended is False

    def test_position_ended_no_loop(self, non_looping_playlist: Playlist) -> None:
        """Test position calculation when non-looping playlist ends."""
        # Playlist is 15 minutes, check at 20 minutes
        now = non_looping_playlist.start_at + timedelta(seconds=1200)
        state = calculate_live_position(non_looping_playlist, now)

        assert state.ended is True

    def test_position_before_start(self, sample_playlist: Playlist) -> None:
        """Test position calculation before playlist starts."""
        now = sample_playlist.start_at - timedelta(minutes=30)
        state = calculate_live_position(sample_playlist, now)

        # Should return first video at position 0
        assert state.video_index == 0
        assert state.video_id == "video-001"
        assert state.position == 0.0
        assert state.ended is False

    def test_position_multiple_loops(self, sample_playlist: Playlist) -> None:
        """Test position calculation after multiple loops."""
        # Playlist is 15 minutes (900s), check at 47 minutes (2820s)
        # 2820 % 900 = 120s (2 minutes into first video)
        now = sample_playlist.start_at + timedelta(seconds=2820)
        state = calculate_live_position(sample_playlist, now)

        assert state.video_index == 0
        assert state.video_id == "video-001"
        assert state.position == pytest.approx(120.0)
        assert state.ended is False

    def test_position_at_video_boundary(self, sample_playlist: Playlist) -> None:
        """Test position calculation exactly at video boundary."""
        # First video ends at 300s
        now = sample_playlist.start_at + timedelta(seconds=300)
        state = calculate_live_position(sample_playlist, now)

        # Should be at start of second video
        assert state.video_index == 1
        assert state.video_id == "video-002"
        assert state.position == 0.0
        assert state.ended is False
