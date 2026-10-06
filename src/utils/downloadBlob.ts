export function downloadBlob (blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Revoked on the next task so the browser has started the download
  setTimeout(() => URL.revokeObjectURL(url))
}
