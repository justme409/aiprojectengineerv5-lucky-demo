'use client'
import React from 'react'

export default function QseExportButton({ docId }: { docId: string }) {
  const onClick = async () => {
    const res = await fetch(`/api/v1/qse/docs/${encodeURIComponent(docId)}/export`)
    if (!res.ok) {
      alert('Failed to export DOCX')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${docId}.docx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
  return (
    <button className="px-3 py-1 border rounded" onClick={onClick}>Export DOCX</button>
  )
}



