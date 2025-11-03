import { notFound } from 'next/navigation'
import { neo4jClient } from '@/lib/neo4j'
import { ProjectNode, PROJECT_QUERIES } from '@/schemas/neo4j/project.schema'
import { getEnrichedProjectById } from '@/lib/actions/project-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, MapPin, Calendar, DollarSign, FileText, Building2, Info } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
	params: Promise<{ projectId: string }>
}

export default async function ProjectDetailsPage({ params }: PageProps) {
	const { projectId } = await params

	// First, check if project exists in Postgres
	const postgresProject = await getEnrichedProjectById(projectId)
	if (!postgresProject) {
		notFound()
	}

	// Try to fetch detailed project data from Neo4j
	const results = await neo4jClient.read<{ project: ProjectNode }>(
		PROJECT_QUERIES.getProject,
		{ projectUuid: projectId }
	)

	const neo4jProject = results[0]?.project
	
	// If Neo4j data doesn't exist yet, use Postgres data as fallback
	const project: Partial<ProjectNode> = neo4jProject || {
		project_uuid: postgresProject.id,
		project_name: postgresProject.displayName,
		project_description: postgresProject.description,
		project_address: postgresProject.location,
		created_at: new Date(postgresProject.created_at),
		updated_at: new Date(postgresProject.updated_at || postgresProject.created_at),
	}

	// Parse parties if exists
	let parties
	try {
		parties = project.parties ? JSON.parse(project.parties) : null
	} catch (e) {
		parties = null
	}

	return (
		<div className="space-y-8">
			{/* Header with back button */}
			<div className="flex items-center gap-4">
				<Link href={`/projects/${projectId}/overview`}>
					<ArrowLeft className="h-6 w-6" />
				</Link>
				<h1 className="text-3xl font-bold text-foreground">Project Details</h1>
			</div>

			{/* Info Banner - Show when Neo4j data is missing */}
			{!neo4jProject && (
				<Alert>
					<Info className="h-4 w-4" />
					<AlertTitle>Limited Project Data</AlertTitle>
					<AlertDescription>
						Showing basic project information. Upload and process project documents to see comprehensive details.
					</AlertDescription>
				</Alert>
			)}

			{/* Project Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{project.project_address && (
					<Card>
						<CardHeader className="flex flex-row items-center space-y-0 pb-2">
							<MapPin className="h-4 w-4 text-muted-foreground mr-2" />
							<CardTitle className="text-sm font-medium">Location</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm">
								<p>{project.project_address}</p>
								{project.state_territory && <p className="text-muted-foreground">{project.state_territory}</p>}
								{project.jurisdiction_code && <p className="text-xs text-muted-foreground mt-1">Jurisdiction: {project.jurisdiction_code}</p>}
							</div>
						</CardContent>
					</Card>
				)}

				{project.key_dates && (
					<Card>
						<CardHeader className="flex flex-row items-center space-y-0 pb-2">
							<Calendar className="h-4 w-4 text-muted-foreground mr-2" />
							<CardTitle className="text-sm font-medium">Key Dates</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm space-y-1">
								{project.key_dates.commencement_date && (
									<p><span className="font-medium">Start:</span> {project.key_dates.commencement_date}</p>
								)}
								{project.key_dates.practical_completion_date && (
									<p><span className="font-medium">Completion:</span> {project.key_dates.practical_completion_date}</p>
								)}
								{project.key_dates.defects_liability_period && (
									<p className="text-xs text-muted-foreground">DLP: {project.key_dates.defects_liability_period}</p>
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{project.contract_value && (
					<Card>
						<CardHeader className="flex flex-row items-center space-y-0 pb-2">
							<DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
							<CardTitle className="text-sm font-medium">Contract Value</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{project.contract_value}</div>
							{project.procurement_method && (
								<p className="text-xs text-muted-foreground mt-1">{project.procurement_method}</p>
							)}
						</CardContent>
					</Card>
				)}

				{project.contract_number && (
					<Card>
						<CardHeader className="flex flex-row items-center space-y-0 pb-2">
							<FileText className="h-4 w-4 text-muted-foreground mr-2" />
							<CardTitle className="text-sm font-medium">Contract Number</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm font-mono">{project.contract_number}</div>
							{project.project_code && (
								<p className="text-xs text-muted-foreground mt-1">Code: {project.project_code}</p>
							)}
						</CardContent>
					</Card>
				)}

				{parties && parties.client && parties.client.length > 0 && (
					<Card>
						<CardHeader className="flex flex-row items-center space-y-0 pb-2">
							<Building2 className="h-4 w-4 text-muted-foreground mr-2" />
							<CardTitle className="text-sm font-medium">Client</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm">
								{parties.client.map((c: any, idx: number) => (
									<p key={idx}>{c.name || c.organisation}</p>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{parties && parties.principal && parties.principal.length > 0 && (
					<Card>
						<CardHeader className="flex flex-row items-center space-y-0 pb-2">
							<Building2 className="h-4 w-4 text-muted-foreground mr-2" />
							<CardTitle className="text-sm font-medium">Principal Contractor</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm">
								{parties.principal.map((p: any, idx: number) => (
									<p key={idx}>{p.name || p.organisation}</p>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Comprehensive Project Details */}
			{project.html_content && !project.html_content.startsWith('file://') ? (
				<Card>
					<CardHeader>
						<CardTitle>{project.project_name || 'Project Details'}</CardTitle>
						<CardDescription>Comprehensive project information and specifications</CardDescription>
					</CardHeader>
					<CardContent>
						<div
							className="prose prose-sm max-w-none dark:prose-invert"
							dangerouslySetInnerHTML={{ __html: project.html_content }}
						/>
					</CardContent>
				</Card>
			) : (
				<>
					{/* Project Description and Scope */}
					<Card>
						<CardHeader>
							<CardTitle>{project.project_name || 'Project Details'}</CardTitle>
							<CardDescription>Project Overview</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{project.project_description && (
								<div>
									<h3 className="font-semibold mb-2">Description</h3>
									<p className="text-sm text-muted-foreground">{project.project_description}</p>
								</div>
							)}
							{project.scope_summary && (
								<div>
									<h3 className="font-semibold mb-2">Scope Summary</h3>
									<p className="text-sm text-muted-foreground">{project.scope_summary}</p>
								</div>
							)}
							{project.jurisdiction && (
								<div>
									<h3 className="font-semibold mb-2">Jurisdiction</h3>
									<p className="text-sm text-muted-foreground">{project.jurisdiction}</p>
								</div>
							)}
							{project.local_council && (
								<div>
									<h3 className="font-semibold mb-2">Local Council</h3>
									<p className="text-sm text-muted-foreground">{project.local_council}</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Regulatory and Standards */}
					{(project.regulatory_framework || (project.applicable_standards && project.applicable_standards.length > 0)) && (
						<Card>
							<CardHeader>
								<CardTitle>Regulatory Framework & Standards</CardTitle>
								<CardDescription>Applicable regulations and standards</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{project.regulatory_framework && (
									<div>
										<h3 className="font-semibold mb-2">Regulatory Framework</h3>
										<p className="text-sm text-muted-foreground">{project.regulatory_framework}</p>
									</div>
								)}
								{project.applicable_standards && project.applicable_standards.length > 0 && (
									<div>
										<h3 className="font-semibold mb-2">Applicable Standards</h3>
										<ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
											{project.applicable_standards.map((standard, idx) => (
												<li key={idx}>{standard}</li>
											))}
										</ul>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Source Documents */}
					{project.source_documents && (
						<Card>
							<CardHeader>
								<CardTitle>Source Documents</CardTitle>
								<CardDescription>Documents used for project information extraction</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
									{(Array.isArray(project.source_documents) 
										? project.source_documents 
										: typeof project.source_documents === 'string'
											? project.source_documents.split(',').map(s => s.trim())
											: []
									).map((doc, idx) => (
										<li key={idx}>{doc}</li>
									))}
								</ul>
							</CardContent>
						</Card>
					)}
				</>
			)}
		</div>
	)
}
