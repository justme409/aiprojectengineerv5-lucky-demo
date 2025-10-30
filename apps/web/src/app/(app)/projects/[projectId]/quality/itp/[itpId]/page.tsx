import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectById } from "@/lib/actions/project-actions";
import { getAssetById } from "@/lib/actions/asset-actions";
import ItpDocumentDetailClient from "@/components/features/itp/ItpDocumentDetailClient";

type ItpDocumentDetailPageProps = {
  params: Promise<{
    projectId: string;
    itpId: string;
  }>;
};

export default async function ItpDocumentDetailPage({ params }: ItpDocumentDetailPageProps) {
  const { projectId, itpId } = await params;

  const session = await auth();
  if (!session?.user) {
    redirect(`/auth/login?message=auth_required&redirectTo=/projects/${projectId}/quality/itp/${itpId}`);
  }

  const project = await getProjectById(projectId);
  if (!project) {
    notFound();
  }
  if (project.created_by_user_id !== (session!.user as any).id) {
    notFound();
  }

  const asset = await getAssetById(itpId);
  if (!asset || asset.project_id !== projectId || asset.type !== 'itp_document') {
    notFound();
  }

  const projectName = project.name || 'Project';

  return (
    <ItpDocumentDetailClient
      itp={asset}
      projectId={projectId}
      itpId={itpId}
      projectName={projectName}
    />
  );
}

export const revalidate = 0


