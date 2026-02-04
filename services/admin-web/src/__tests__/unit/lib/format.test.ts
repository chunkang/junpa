import { describe, it, expect } from 'vitest'
import { formatDuration, formatFileSize } from '@/lib/format'

describe('formatDuration', () => {
  it('should format zero seconds', () => {
    expect(formatDuration(0)).toBe('0:00')
  })

  it('should format seconds under a minute', () => {
    expect(formatDuration(5)).toBe('0:05')
    expect(formatDuration(30)).toBe('0:30')
    expect(formatDuration(59)).toBe('0:59')
  })

  it('should format minutes and seconds', () => {
    expect(formatDuration(60)).toBe('1:00')
    expect(formatDuration(61)).toBe('1:01')
    expect(formatDuration(125)).toBe('2:05')
    expect(formatDuration(600)).toBe('10:00')
    expect(formatDuration(3599)).toBe('59:59')
  })

  it('should format hours, minutes, and seconds', () => {
    expect(formatDuration(3600)).toBe('1:00:00')
    expect(formatDuration(3661)).toBe('1:01:01')
    expect(formatDuration(7384)).toBe('2:03:04')
    expect(formatDuration(36000)).toBe('10:00:00')
  })

  it('should floor fractional seconds', () => {
    expect(formatDuration(61.7)).toBe('1:01')
    expect(formatDuration(0.9)).toBe('0:00')
  })

  it('should handle negative values gracefully', () => {
    expect(formatDuration(-1)).toBe('0:00')
    expect(formatDuration(-100)).toBe('0:00')
  })

  it('should handle NaN and Infinity', () => {
    expect(formatDuration(NaN)).toBe('0:00')
    expect(formatDuration(Infinity)).toBe('0:00')
    expect(formatDuration(-Infinity)).toBe('0:00')
  })
})

describe('formatFileSize', () => {
  it('should format zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('should format bytes', () => {
    expect(formatFileSize(1)).toBe('1 B')
    expect(formatFileSize(100)).toBe('100 B')
    expect(formatFileSize(1023)).toBe('1023 B')
  })

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB')
    expect(formatFileSize(1536)).toBe('1.5 KB')
    expect(formatFileSize(10240)).toBe('10.0 KB')
  })

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.0 MB')
    expect(formatFileSize(1258291)).toBe('1.2 MB')
    expect(formatFileSize(52428800)).toBe('50.0 MB')
  })

  it('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1.0 GB')
    expect(formatFileSize(3650722201)).toBe('3.4 GB')
  })

  it('should format terabytes', () => {
    expect(formatFileSize(1099511627776)).toBe('1.0 TB')
  })

  it('should handle negative values gracefully', () => {
    expect(formatFileSize(-1)).toBe('0 B')
    expect(formatFileSize(-1000)).toBe('0 B')
  })

  it('should handle NaN and Infinity', () => {
    expect(formatFileSize(NaN)).toBe('0 B')
    expect(formatFileSize(Infinity)).toBe('0 B')
  })
})
