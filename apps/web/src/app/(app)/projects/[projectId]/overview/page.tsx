import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEnrichedProjectById } from '@/lib/actions/project-actions'
import { getAssets } from '@/lib/actions/asset-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  Mail,
  Settings,
  ChevronRight
} from 'lucide-react'

interface PageProps {
	params: Promise<{ projectId: string }>
}

export default async function ProjectOverviewPage({ params }: PageProps) {
	const { projectId } = await params
	const enrichedProject = await getEnrichedProjectById(projectId)
	if (!enrichedProject) notFound()

	const project = enrichedProject
	const projectAsset = enrichedProject.projectAsset
	const jurisdiction = projectAsset?.content?.jurisdiction || 'unknown'

	const assets: any[] = await getAssets({ project_id: projectId, limit: 10 })

	// Jurisdiction-based feature flags
	const showPrimaryTesting = jurisdiction === 'NSW'
	const showJurisdictionSpecificContent = jurisdiction !== 'unknown'

	// Jurisdiction display logic
	const getJurisdictionDisplayName = (jurisdiction: string) => {
		switch (jurisdiction.toLowerCase()) {
			case 'nsw': return 'New South Wales'
			case 'qld': return 'Queensland'
			case 'vic': return 'Victoria'
			case 'sa': return 'South Australia'
			case 'wa': return 'Western Australia'
			case 'tas': return 'Tasmania'
			case 'nt': return 'Northern Territory'
			case 'act': return 'Australian Capital Territory'
			default: return jurisdiction.toUpperCase()
		}
	}

	return (
		<div className="space-y-8">
			{/* Project Header */}
			<div className="bg-card rounded-lg border shadow-sm p-6 opacity-30">
				<div className="flex justify-between items-start">
					<div>
						<h1 className="text-3xl font-bold text-card-foreground">{enrichedProject.displayName}</h1>
						<p className="text-muted-foreground mt-2">{projectAsset?.content?.description || project.description}</p>
					</div>
					<div className="text-sm text-muted-foreground">
						<strong>Jurisdiction:</strong> {getJurisdictionDisplayName(jurisdiction)}
					</div>
				</div>
				<div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
					<div><strong>Client:</strong> {enrichedProject.displayClient}</div>
					<div><strong>Location:</strong> {projectAsset?.content?.project_address || projectAsset?.content?.location || project.location}</div>
					<div><strong>State/Territory:</strong> {projectAsset?.content?.state_territory}</div>
                    <div><strong>Local Council:</strong> {projectAsset?.content?.local_council}</div>
                    {/* <div><strong>Regulatory Framework:</strong> {projectAsset?.content?.regulatory_framework}</div> */}
                    {/* Project details link moved to Documents section */}
				</div>
			</div>

			{/* Main Navigation Sections */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

				{/* Project Controls */}
				<Card>
					<CardHeader>
						<CardTitle>Project Controls</CardTitle>
						<CardDescription>Plans, schedule, and structure</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/projects/${projectId}/management-plans`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Management Plans
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/structure/wbs`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								WBS
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/structure/lbs`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								LBS
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Quality */}
				<Card>
					<CardHeader>
						<CardTitle>Quality</CardTitle>
						<CardDescription>Quality assurance and control</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/projects/${projectId}/quality/lots`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Lot Register
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/quality/itps/templates`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								ITP Templates
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/quality/itps/instances`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								ITP Instances
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/ncrs`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								NCR Register
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/quality/tests`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Test Requests
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/quality/materials`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Materials
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Progress & Payment */}
				<Card>
					<CardHeader>
						<CardTitle>Progress & Payment</CardTitle>
						<CardDescription>Claims and variations</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Link href={`/projects/${projectId}/progress/schedule-items`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Schedule Items
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/progress/claims`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Progress Claims
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/progress/variations`}>
							<Button variant="ghost" className="w-full justify-start">
								<FileText className="mr-2 h-4 w-4" />
								Variations
								<ChevronRight className="ml-auto h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Documents */}
				<Card>
                    <CardHeader>
						<CardTitle>Documents</CardTitle>
						<CardDescription>All project documentation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href={`/projects/${projectId}/documents`}>
							<Button variant="ghost" className="w-full justify-start">
                                <FileText className="mr-2 h-4 w-4" />
                                Document Register
                                <ChevronRight className="ml-auto h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={`/projects/${projectId}/photos`}>
							<Button variant="ghost" className="w-full justify-start">
                                <FileText className="mr-2 h-4 w-4" />
                                Photos
                                <ChevronRight className="ml-auto h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
			</div>
		</div>
	)
}
