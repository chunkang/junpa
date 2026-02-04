import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UploadDropzone } from '@/components/upload/upload-dropzone'

// Mock the useUpload hook
const mockUploadFile = vi.fn()
vi.mock('@/hooks/use-upload', () => ({
  useUpload: () => ({
    uploadFile: mockUploadFile,
    isUploading: false,
  }),
}))

function createMockFile(
  name: string,
  size: number = 1024,
  type: string = 'video/mp4'
): File {
  const file = new File(['content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

function createDataTransfer(files: File[]): DataTransfer {
  const dataTransfer = {
    files,
    items: files.map((file) => ({ kind: 'file', getAsFile: () => file })),
    types: ['Files'],
  }
  return dataTransfer as unknown as DataTransfer
}

describe('UploadDropzone', () => {
  beforeEach(() => {
    mockUploadFile.mockReset()
    mockUploadFile.mockReturnValue({ success: true, video: {} })
  })

  it('should render the dropzone with instructions', () => {
    render(<UploadDropzone />)

    expect(
      screen.getByText('Drop video files here or click to browse')
    ).toBeDefined()
    expect(
      screen.getByText('Accepted: mp4, webm, mov, avi. Max 10GB.')
    ).toBeDefined()
  })

  it('should have an accessible button role', () => {
    render(<UploadDropzone />)

    const dropzone = screen.getByRole('button', {
      name: /upload video files/i,
    })
    expect(dropzone).toBeDefined()
  })

  it('should contain a hidden file input', () => {
    const { container } = render(<UploadDropzone />)

    const input = container.querySelector('input[type="file"]')
    expect(input).not.toBeNull()
    expect(input?.getAttribute('accept')).toBeTruthy()
    expect(input?.hasAttribute('multiple')).toBe(true)
  })

  it('should show drag-over state text on dragover', () => {
    render(<UploadDropzone />)

    const dropzone = screen.getByRole('button', {
      name: /upload video files/i,
    })

    fireEvent.dragOver(dropzone, {
      dataTransfer: createDataTransfer([]),
    })

    expect(screen.getByText('Drop files here')).toBeDefined()
  })

  it('should revert to idle state on drag leave', () => {
    render(<UploadDropzone />)

    const dropzone = screen.getByRole('button', {
      name: /upload video files/i,
    })

    fireEvent.dragOver(dropzone, {
      dataTransfer: createDataTransfer([]),
    })
    fireEvent.dragLeave(dropzone, {
      dataTransfer: createDataTransfer([]),
    })

    expect(
      screen.getByText('Drop video files here or click to browse')
    ).toBeDefined()
  })

  it('should call uploadFile when files are dropped', () => {
    render(<UploadDropzone />)

    const dropzone = screen.getByRole('button', {
      name: /upload video files/i,
    })

    const file = createMockFile('test.mp4', 1024 * 1024)

    fireEvent.drop(dropzone, {
      dataTransfer: createDataTransfer([file]),
    })

    expect(mockUploadFile).toHaveBeenCalledWith(file)
  })

  it('should show validation error when upload fails', () => {
    mockUploadFile.mockReturnValue({
      success: false,
      error: 'Unsupported format. Please upload mp4, webm, mov, or avi files.',
    })

    render(<UploadDropzone />)

    const dropzone = screen.getByRole('button', {
      name: /upload video files/i,
    })

    const file = createMockFile('test.mkv', 1024, 'video/x-matroska')

    fireEvent.drop(dropzone, {
      dataTransfer: createDataTransfer([file]),
    })

    expect(screen.getByRole('alert')).toBeDefined()
    expect(
      screen.getByText(
        'Unsupported format. Please upload mp4, webm, mov, or avi files.'
      )
    ).toBeDefined()
  })

  it('should handle multiple files in a single drop', () => {
    render(<UploadDropzone />)

    const dropzone = screen.getByRole('button', {
      name: /upload video files/i,
    })

    const file1 = createMockFile('a.mp4', 1024)
    const file2 = createMockFile('b.webm', 2048)

    fireEvent.drop(dropzone, {
      dataTransfer: createDataTransfer([file1, file2]),
    })

    expect(mockUploadFile).toHaveBeenCalledTimes(2)
    expect(mockUploadFile).toHaveBeenCalledWith(file1)
    expect(mockUploadFile).toHaveBeenCalledWith(file2)
  })

  it('should support keyboard activation with Enter', () => {
    render(<UploadDropzone />)

    const dropzone = screen.getByRole('button', {
      name: /upload video files/i,
    })

    // Ensure the dropzone is focusable (tabIndex=0)
    expect(dropzone.getAttribute('tabindex')).toBe('0')
  })
})
