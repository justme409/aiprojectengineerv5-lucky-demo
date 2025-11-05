import { notFound } from 'next/navigation'
import Link from 'next/link'
import { neo4jClient } from '@/lib/neo4j'
import { ProjectNode, PROJECT_QUERIES } from '@/schemas/neo4j'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  Mail,
  Settings,
  ChevronRight,
  Map,
  Building2,
  CheckSquare,
  AlertTriangle,
  Camera,
  ClipboardList,
  Users,
  BarChart3,
  FolderOpen,
  Shield,
  Workflow
} from 'lucide-react'

interface PageProps {
	params: Promise<{ projectId: string }>
}

export default async function ProjectOverviewPage({ params }: PageProps) {
	const { projectId } = await params

	const results = await neo4jClient.read<{ project: ProjectNode }>(
		PROJECT_QUERIES.getProject,
		{ projectId }
	)

	const project = results[0]?.project

	if (!project) {
		notFound()
	}

	let parties
	try {
		parties = project.parties ? JSON.parse(project.parties) : null
	} catch (error) {
		parties = null
	}

	const jurisdiction = project.jurisdictionCode || project.jurisdiction || 'unknown'

	// Jurisdiction display logic
	const getJurisdictionDisplayName = (jurisdiction: string) => {
		switch (jurisdiction.toUpperCase()) {
			case 'NSW': return 'New South Wales'
			case 'QLD': return 'Queensland'
			case 'VIC': return 'Victoria'
			case 'SA': return 'South Australia'
			case 'WA': return 'Western Australia'
			case 'TAS': return 'Tasmania'
			case 'NT': return 'Northern Territory'
			case 'ACT': return 'Australian Capital Territory'
			default: return jurisdiction.toUpperCase()
		}
	}

	return (
		<div className="space-y-8">
			{/* Project Header */}
			<div className="bg-card rounded-lg border shadow-sm p-6">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-card-foreground">{project.projectName || 'Project'}</h1>
						<p className="text-muted-foreground mt-2">{project.projectDescription || project.scopeSummary}</p>
					</div>
					{jurisdiction !== 'unknown' && (
						<div className="text-sm text-muted-foreground ml-4">
							<strong>Jurisdiction:</strong> {getJurisdictionDisplayName(jurisdiction)}
						</div>
					)}
				</div>
			<div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
				{parties?.client?.[0] && <div><strong>Client:</strong> {parties.client[0]?.organisation || parties.client[0]?.name || 'N/A'}</div>}
					{project.projectAddress && <div><strong>Location:</strong> {project.projectAddress}</div>}
					{project.stateTerritory && <div><strong>State/Territory:</strong> {project.stateTerritory}</div>}
					{project.localCouncil && <div><strong>Local Council:</strong> {project.localCouncil}</div>}
					{project.contractValue && <div><strong>Contract Value:</strong> {project.contractValue}</div>}
				</div>
			</div>

			{/* Main Navigation Sections */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

				{/* Project Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							Project Information
						</CardTitle>
						<CardDescription>Core project details and overview</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Link href={`/projects/${projectId}/details`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Project Details</div>
										<div className="text-xs text-muted-foreground">Comprehensive project information and specifications</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Project Controls */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ClipboardList className="h-5 w-5" />
							Project Controls
						</CardTitle>
						<CardDescription>Plans, schedule, and structure</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Link href={`/projects/${projectId}/management-plans`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Management Plans</div>
										<div className="text-xs text-muted-foreground">Quality, Environmental, Safety, and other management plans</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/structure/wbs`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FolderOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Work Breakdown Structure (WBS)</div>
										<div className="text-xs text-muted-foreground">Hierarchical decomposition of project deliverables</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/structure/lbs`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<Map className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Location Breakdown Structure (LBS)</div>
										<div className="text-xs text-muted-foreground">Spatial organization of construction work locations</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Quality */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckSquare className="h-5 w-5" />
							Quality
						</CardTitle>
						<CardDescription>Quality assurance and control</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Link href={`/projects/${projectId}/quality/itps/templates`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">ITP Templates</div>
										<div className="text-xs text-muted-foreground">Inspection and Test Plan templates by work type</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/quality/itps/instances`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">ITP Instances</div>
										<div className="text-xs text-muted-foreground">Active ITPs for specific work packages and lots</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/quality/lots`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Lot Register</div>
										<div className="text-xs text-muted-foreground">Discrete work packages with quality control</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/inspections`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<CheckSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Inspections</div>
										<div className="text-xs text-muted-foreground">Inspection requests, schedules, and records</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/tests`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Test Requests</div>
										<div className="text-xs text-muted-foreground">Laboratory testing and material compliance</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/samples`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Samples</div>
										<div className="text-xs text-muted-foreground">Sample collection and testing records</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/ncrs`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">NCR Register</div>
										<div className="text-xs text-muted-foreground">Non-conformance reports and corrective actions</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/materials`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Materials</div>
										<div className="text-xs text-muted-foreground">Material specifications and compliance tracking</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/mix-designs`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Mix Designs</div>
										<div className="text-xs text-muted-foreground">Approved concrete and asphalt mix designs</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Progress & Payment */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BarChart3 className="h-5 w-5" />
							Progress & Payment
						</CardTitle>
						<CardDescription>Claims, variations, and schedule</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Link href={`/projects/${projectId}/progress/schedule-items`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Schedule Items</div>
										<div className="text-xs text-muted-foreground">Contract schedule of rates and payment items</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/progress/claims`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Progress Claims</div>
										<div className="text-xs text-muted-foreground">Monthly progress claims and payment applications</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/progress/variations`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Variations</div>
										<div className="text-xs text-muted-foreground">Contract variations and change orders</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Documents */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FolderOpen className="h-5 w-5" />
							Documents
						</CardTitle>
						<CardDescription>All project documentation</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Link href={`/projects/${projectId}/documents`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Document Register</div>
										<div className="text-xs text-muted-foreground">Drawings, specifications, and project documents</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/photos`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<Camera className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Photos</div>
										<div className="text-xs text-muted-foreground">Site photos and progress imagery</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/certificates`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Certificates</div>
										<div className="text-xs text-muted-foreground">Test certificates, calibrations, and approvals</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Field Operations */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Field Operations
						</CardTitle>
						<CardDescription>Daily site activities and records</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Link href={`/projects/${projectId}/field`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Daily Diaries</div>
										<div className="text-xs text-muted-foreground">Daily construction records and site activities</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/methods`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Method Statements</div>
										<div className="text-xs text-muted-foreground">Construction procedures and SWMS</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Reports & Analytics */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BarChart3 className="h-5 w-5" />
							Reports & Analytics
						</CardTitle>
						<CardDescription>Project insights and reporting</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Link href={`/projects/${projectId}/reports`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Reports</div>
										<div className="text-xs text-muted-foreground">Project reports, dashboards, and analytics</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Approvals & Workflow */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Workflow className="h-5 w-5" />
							Approvals & Workflow
						</CardTitle>
						<CardDescription>Document approvals and workflows</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Link href={`/projects/${projectId}/approvals`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<CheckSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Approvals</div>
										<div className="text-xs text-muted-foreground">Approval workflows and document sign-offs</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/inbox`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Inbox</div>
										<div className="text-xs text-muted-foreground">Incoming correspondence and email tracking</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Reference & Standards */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							Reference & Standards
						</CardTitle>
						<CardDescription>Standards library and requirements</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Link href={`/projects/${projectId}/reference`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Reference Documents</div>
										<div className="text-xs text-muted-foreground">Standards, codes, and reference specifications</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
						<Link href={`/projects/${projectId}/plans`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<Map className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Site Plans & Drawings</div>
										<div className="text-xs text-muted-foreground">Site layouts, plans, and as-built drawings</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
					</CardContent>
				</Card>

				{/* Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5" />
							Settings
						</CardTitle>
						<CardDescription>Project configuration</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Link href={`/projects/${projectId}/settings`}>
							<Button variant="ghost" className="w-full justify-between text-sm h-auto py-3">
								<span className="flex items-start gap-2 text-left">
									<Settings className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span className="flex-1">
										<div className="font-medium">Project Settings</div>
										<div className="text-xs text-muted-foreground">Configure project permissions and preferences</div>
									</span>
								</span>
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
