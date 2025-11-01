import { notFound } from 'next/navigation'
import { neo4jClient } from '@/lib/neo4j'
import { ProjectNode, PROJECT_QUERIES } from '@/schemas/neo4j/project.schema'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, MapPin, Calendar, DollarSign, FileText, Building2 } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
	params: Promise<{ projectId: string }>
}

export default async function ProjectDetailsPage({ params }: PageProps) {
	const { projectId } = await params

	// Fetch project from Neo4j
	const results = await neo4jClient.read<{ project: ProjectNode }>(
		PROJECT_QUERIES.getProject,
		{ projectId }
	)

	const project = results[0]?.project

	if (!project) {
		notFound()
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
				<Link href={`/projects/${projectId}`}>
					<ArrowLeft className="h-6 w-6" />
				</Link>
				<h1 className="text-3xl font-bold text-gray-900">Project Details</h1>
			</div>

			{/* Project Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{project.projectAddress && (
					<Card>
						<CardHeader className="flex flex-row items-center space-y-0 pb-2">
							<MapPin className="h-4 w-4 text-muted-foreground mr-2" />
							<CardTitle className="text-sm font-medium">Location</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm">
								<p>{project.projectAddress}</p>
								{project.stateTerritory && <p className="text-muted-foreground">{project.stateTerritory}</p>}
								{project.jurisdictionCode && <p className="text-xs text-muted-foreground mt-1">Jurisdiction: {project.jurisdictionCode}</p>}
							</div>
						</CardContent>
					</Card>
				)}

				{project.keyDates && (
					<Card>
						<CardHeader className="flex flex-row items-center space-y-0 pb-2">
							<Calendar className="h-4 w-4 text-muted-foreground mr-2" />
							<CardTitle className="text-sm font-medium">Key Dates</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm space-y-1">
								{project.keyDates.commencementDate && (
									<p><span className="font-medium">Start:</span> {project.keyDates.commencementDate}</p>
								)}
								{project.keyDates.practicalCompletionDate && (
									<p><span className="font-medium">Completion:</span> {project.keyDates.practicalCompletionDate}</p>
								)}
								{project.keyDates.defectsLiabilityPeriod && (
									<p className="text-xs text-muted-foreground">DLP: {project.keyDates.defectsLiabilityPeriod}</p>
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{project.contractValue && (
					<Card>
						<CardHeader className="flex flex-row items-center space-y-0 pb-2">
							<DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
							<CardTitle className="text-sm font-medium">Contract Value</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{project.contractValue}</div>
							{project.procurementMethod && (
								<p className="text-xs text-muted-foreground mt-1">{project.procurementMethod}</p>
							)}
						</CardContent>
					</Card>
				)}

				{project.contractNumber && (
					<Card>
						<CardHeader className="flex flex-row items-center space-y-0 pb-2">
							<FileText className="h-4 w-4 text-muted-foreground mr-2" />
							<CardTitle className="text-sm font-medium">Contract Number</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm font-mono">{project.contractNumber}</div>
							{project.projectCode && (
								<p className="text-xs text-muted-foreground mt-1">Code: {project.projectCode}</p>
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
			{project.html ? (
				<Card>
					<CardHeader>
						<CardTitle>{project.projectName || project.name || 'Project Details'}</CardTitle>
						<CardDescription>Comprehensive project information and specifications</CardDescription>
					</CardHeader>
					<CardContent>
						<div
							className="prose max-w-none"
							dangerouslySetInnerHTML={{ __html: project.html }}
						/>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>{project.projectName || project.name}</CardTitle>
						<CardDescription>Project Overview</CardDescription>
					</CardHeader>
					<CardContent>
						{project.projectDescription && (
							<div className="mb-4">
								<h3 className="font-semibold mb-2">Description</h3>
								<p className="text-sm text-muted-foreground">{project.projectDescription}</p>
							</div>
						)}
						{project.scopeSummary && (
							<div className="mb-4">
								<h3 className="font-semibold mb-2">Scope Summary</h3>
								<p className="text-sm text-muted-foreground">{project.scopeSummary}</p>
							</div>
						)}
						{project.regulatoryFramework && (
							<div className="mb-4">
								<h3 className="font-semibold mb-2">Regulatory Framework</h3>
								<p className="text-sm text-muted-foreground">{project.regulatoryFramework}</p>
							</div>
						)}
						{project.applicableStandards && project.applicableStandards.length > 0 && (
							<div>
								<h3 className="font-semibold mb-2">Applicable Standards</h3>
								<ul className="list-disc list-inside text-sm text-muted-foreground">
									{project.applicableStandards.map((standard, idx) => (
										<li key={idx}>{standard}</li>
									))}
								</ul>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	)
}
