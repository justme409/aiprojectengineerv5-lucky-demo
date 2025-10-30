import { Suspense } from 'react'
import ProjectList from '@/components/features/project/ProjectList'

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div>Loading projects...</div>}>
      <ProjectList />
    </Suspense>
  )
}
