import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectById } from "@/lib/actions/project-actions";
import { getAssetById } from "@/lib/actions/asset-actions";
import ItpTemplateDetailClient from "@/components/features/itp/ItpTemplateDetailClient";

export default async function ItpTemplateDetailPage({ params }: { params: Promise<{ projectId: string; templateId: string }> }) {
  const { projectId, templateId } = await params;

  const session = await auth();
  if (!session?.user) {
    redirect(`/auth/login?message=auth_required&redirectTo=/projects/${projectId}/quality/itp-templates-register/${templateId}`);
  }

  const project = await getProjectById(projectId);
  if (!project) {
    notFound();
  }
  if (project.created_by_user_id !== (session!.user as any).id) {
    notFound();
  }

  const template = await getAssetById(templateId);
  if (!template || template.project_id !== projectId || !['itp_template', 'itp_document'].includes(template.type)) {
    notFound();
  }

  return (
    <ItpTemplateDetailClient
      template={template}
      projectId={projectId}
      templateId={templateId}
      projectName={project.name}
    />
  );
}

export const revalidate = 0


