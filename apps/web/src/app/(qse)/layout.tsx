import QseLayoutClient from './qse/qse-layout-client'

export default function QseGroupLayout({ children }: { children: React.ReactNode }) {
  return <QseLayoutClient>{children}</QseLayoutClient>
}
