import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { neo4jClient } from '@/lib/neo4j'
import {
  ProjectNode,
  ProjectIdentifierNode,
  PartyNode,
  PartyContactNode,
  PartyContactCategory,
  PROJECT_QUERIES,
  PROJECT_IDENTIFIER_QUERIES,
  PARTY_QUERIES,
  PARTY_CONTACT_QUERIES,
} from '@/schemas/neo4j'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Users,
  Network,
  Hash,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ projectId: string }>
}

type ContactCategoryKey = PartyContactCategory | 'Uncategorised'

const CONTACT_CATEGORY_LABELS: Record<ContactCategoryKey, string> = {
  'Client': 'Client Contacts',
  'Principal Contractor': 'Principal Contractor Contacts',
  'Consultants/Engineers': 'Consultants & Engineers',
  'Subcontractors': 'Subcontractors',
  'Authorities/Others': 'Authorities & Other Stakeholders',
  'Uncategorised': 'Uncategorised Contacts',
}

const CONTACT_CATEGORY_ORDER: ContactCategoryKey[] = [
  'Client',
  'Principal Contractor',
  'Consultants/Engineers',
  'Subcontractors',
  'Authorities/Others',
  'Uncategorised',
]

const PARTY_ROLE_DISPLAY_ORDER = [
  'Client',
  'Principal',
  'Principal Contractor',
  'Superintendent',
  'Consultant',
  'Authority',
  'Subcontractor',
  'Other',
]

const normaliseStringList = (value?: string[] | string | null): string[] => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((entry) => entry.trim()).filter(Boolean)
  }
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

const formatDateValue = (value?: unknown): string | null => {
  if (!value) return null

  if (value instanceof Date) {
    return value.toISOString().split('T')[0]
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const parsed = new Date(trimmed)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0]
    }
    return trimmed
  }

  return String(value)
}

const titleCaseStatus = (status?: string | null): string | null => {
  if (!status) return null
  return status
    .toLowerCase()
    .split(/[_\s]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

const telHref = (value?: string | null): string | null => {
  if (!value) return null
  const digits = value.replace(/[^+\d]/g, '')
  if (!digits) return null
  return `tel:${digits}`
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const formatComplexValue = (value: unknown): string | null => {
  if (value === null || value === undefined) return null

  if (Array.isArray(value)) {
    const parts = value
      .map((entry) => formatComplexValue(entry))
      .filter((entry): entry is string => Boolean(entry))
    if (parts.length === 0) return null
    return parts.join(', ')
  }

  if (isPlainObject(value)) {
    const parts = Object.entries(value)
      .map(([key, val]) => {
        const formatted = formatComplexValue(val)
        return formatted ? `${key}: ${formatted}` : null
      })
      .filter((entry): entry is string => Boolean(entry))
    if (parts.length === 0) return null
    return parts.join('; ')
  }

  const stringValue = String(value).trim()
  return stringValue.length > 0 ? stringValue : null
}

const formatKeyLabel = (key: string): string =>
  key
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())

export default async function ProjectDetailsPage({ params }: PageProps) {
  const { projectId } = await params

  const [projectRecords, partyNodes, partyContactNodes, identifierNodes] = await Promise.all([
    neo4jClient.read<ProjectNode>(PROJECT_QUERIES.getProject, { projectId }),
    neo4jClient.read<PartyNode>(PARTY_QUERIES.getAllParties, { projectId }),
    neo4jClient.read<PartyContactNode>(PARTY_CONTACT_QUERIES.getAllContacts, { projectId }),
    neo4jClient.read<ProjectIdentifierNode>(PROJECT_IDENTIFIER_QUERIES.getAllIdentifiers, { projectId }),
  ])

  const project = projectRecords[0]

  if (!project) {
    notFound()
  }

  const partyByCode = new Map(partyNodes.map((party) => [party.code, party]))

  const partiesByRole = new Map<string, PartyNode[]>()
  for (const party of partyNodes) {
    const roleKey = (party.role || '').trim() || 'Other'
    const existing = partiesByRole.get(roleKey) ?? []
    existing.push(party)
    partiesByRole.set(roleKey, existing)
  }

  const sortedPartyRoles = Array.from(partiesByRole.keys()).sort((a, b) => {
    const indexA = PARTY_ROLE_DISPLAY_ORDER.indexOf(a)
    const indexB = PARTY_ROLE_DISPLAY_ORDER.indexOf(b)
    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  const contactsByCategory = new Map<ContactCategoryKey, PartyContactNode[]>()
  for (const category of CONTACT_CATEGORY_ORDER) {
    contactsByCategory.set(category, [])
  }
  for (const contact of partyContactNodes) {
    const category = (contact.category as PartyContactCategory | undefined) ?? 'Uncategorised'
    const groupKey = (CONTACT_CATEGORY_ORDER.includes(category as ContactCategoryKey)
      ? category
      : 'Uncategorised') as ContactCategoryKey
    contactsByCategory.get(groupKey)!.push(contact)
  }

  for (const [, list] of contactsByCategory) {
    list.sort((a, b) => a.name.localeCompare(b.name))
  }

  const contactsByParty = new Map<string, PartyContactNode[]>()
  for (const contact of partyContactNodes) {
    if (!contact.partyCode) continue
    const existing = contactsByParty.get(contact.partyCode) ?? []
    existing.push(contact)
    contactsByParty.set(contact.partyCode, existing)
  }
  for (const [, list] of contactsByParty) {
    list.sort((a, b) => a.name.localeCompare(b.name))
  }

  const sortedIdentifiers = [...identifierNodes].sort((a, b) => {
    const byType = a.codeType.localeCompare(b.codeType)
    if (byType !== 0) return byType
    return a.identifier.localeCompare(b.identifier)
  })

  const sourceDocuments = normaliseStringList(project.sourceDocuments ?? null)
  const standards = Array.from(new Set(project.applicableStandards ?? [])).filter(Boolean)

  const commencement = formatDateValue(project.keyDates?.commencementDate)
  const completion = formatDateValue(project.keyDates?.practicalCompletionDate)
  const defectsLiability = project.keyDates?.defectsLiabilityPeriod ?? null

  let partiesSummary: Record<string, unknown> | null = null
  if (project.parties) {
    if (typeof project.parties === 'string') {
      try {
        const parsed = JSON.parse(project.parties)
        if (isPlainObject(parsed)) {
          partiesSummary = parsed
        }
      } catch (error) {
        console.warn('Unable to parse project.parties JSON', error)
      }
    } else if (isPlainObject(project.parties)) {
      partiesSummary = project.parties
    }
  }

  const partySummaryEntries = partiesSummary
    ? Object.entries(partiesSummary)
        .map(([key, value]) => {
          const formatted = formatComplexValue(value)
          return formatted ? { key, value: formatted } : null
        })
        .filter((entry): entry is { key: string; value: string } => Boolean(entry))
    : []

  const clientParties = partiesByRole.get('Client') ?? []
  const principalParties = partiesByRole.get('Principal Contractor')
    ?? partiesByRole.get('Principal')
    ?? []

  const contactSections = CONTACT_CATEGORY_ORDER
    .map((category) => ({
      category,
      contacts: contactsByCategory.get(category) ?? [],
    }))
    .filter((section) => section.contacts.length > 0)

  const makeDefinitionItems = (
    items: Array<{ label: string; value: string | null | undefined }>
  ) =>
    items.filter(
      (item): item is { label: string; value: string } =>
        typeof item.value === 'string' && item.value.trim().length > 0
    );

  const renderDefinitionList = (items: Array<{ label: string; value: string }>) => (
    <dl className="space-y-1 text-sm leading-6">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col sm:flex-row sm:gap-4">
          <dt className="font-medium text-foreground sm:w-48">{label}</dt>
          <dd className="text-muted-foreground sm:flex-1">{value}</dd>
        </div>
      ))}
    </dl>
  );

  const locationDetails = makeDefinitionItems([
    { label: 'Project address', value: project.projectAddress },
    { label: 'State / territory', value: project.stateTerritory },
    { label: 'Local council', value: project.localCouncil },
    { label: 'Jurisdiction', value: project.jurisdiction },
  ]);

  const keyDateDetails = makeDefinitionItems([
    { label: 'Commencement', value: commencement },
    { label: 'Practical completion', value: completion },
    { label: 'Defects liability period', value: defectsLiability },
  ]);

  const governanceDetails = makeDefinitionItems([
    { label: 'Lead agency', value: project.agency },
  ]);

  const narrativeParagraphs = [project.projectDescription, project.scopeSummary]
    .map((paragraph) => (typeof paragraph === 'string' ? paragraph.trim() : ''))
    .filter((paragraph) => paragraph.length > 0);

  const statusLabel = titleCaseStatus(project.status);

  return (
    <article className="mx-auto max-w-4xl space-y-12 pt-6 -ml-6">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-4 pl-4">
          <Link
            href={`/projects/${projectId}/overview`}
            className="mt-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">
              {project.projectName || 'Project Details'}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {narrativeParagraphs[0] ||
                'Curated overview of project metadata, narrative, parties, contacts, and identifiers.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {statusLabel && (
            <Badge variant="outline" className="uppercase tracking-wide">
              {statusLabel}
            </Badge>
          )}
          {project.jurisdiction && (
            <Badge variant="secondary">{project.jurisdiction}</Badge>
          )}
          {project.agency && (
            <Badge variant="outline">{project.agency}</Badge>
          )}
        </div>
      </header>

      <section className="space-y-8 pl-10">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Project overview</h2>
          {narrativeParagraphs.length > 0 ? (
            narrativeParagraphs.map((paragraph, index) => (
              <p key={index} className="text-sm leading-6 text-muted-foreground">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No narrative has been recorded for this project yet.
            </p>
          )}
        </div>

        {locationDetails.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Location
            </h3>
            {renderDefinitionList(locationDetails)}
          </div>
        )}

        {keyDateDetails.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Key dates
            </h3>
            {renderDefinitionList(keyDateDetails)}
          </div>
        )}

        {(governanceDetails.length > 0 ||
          (typeof project.regulatoryFramework === 'string' &&
            project.regulatoryFramework.trim().length > 0) ||
          standards.length > 0 ||
          sourceDocuments.length > 0 ||
          partySummaryEntries.length > 0) && (
          <div className="grid gap-8 md:grid-cols-2">
            {(governanceDetails.length > 0 ||
              (typeof project.regulatoryFramework === 'string' &&
                project.regulatoryFramework.trim().length > 0) ||
              standards.length > 0 ||
              sourceDocuments.length > 0) && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Governance & context
                </h3>
                {governanceDetails.length > 0 && renderDefinitionList(governanceDetails)}
                {project.regulatoryFramework &&
                  project.regulatoryFramework.trim().length > 0 && (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {project.regulatoryFramework}
                    </p>
                  )}
                {standards.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Applicable standards</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      {standards.map((standard) => (
                        <li key={standard}>{standard}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {sourceDocuments.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Source documents</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      {sourceDocuments.map((doc) => (
                        <li key={doc}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {partySummaryEntries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Structured party notes
                </h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {partySummaryEntries.map(({ key, value }) => (
                    <li key={key}>
                      <span className="font-medium text-foreground">{formatKeyLabel(key)}:</span>{' '}
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="space-y-6 pl-10">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Key organisations</h2>
            <p className="text-sm text-muted-foreground">
              Structured by contractual role with primary contacts surfaced alongside each organisation.
            </p>
          </div>
        </div>
        {partyNodes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No parties captured yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-background">
            <Table className="text-sm [&_*]:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[9rem]">Role</TableHead>
                  <TableHead className="min-w-[14rem]">Organisation</TableHead>
                  <TableHead className="min-w-[10rem]">Contact person</TableHead>
                  <TableHead className="min-w-[14rem]">Email</TableHead>
                  <TableHead className="min-w-[9rem]">Phone</TableHead>
                  <TableHead className="min-w-[14rem]">Address</TableHead>
                  <TableHead className="min-w-[9rem]">ABN / ACN</TableHead>
                  <TableHead className="min-w-[16rem]">Primary contacts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPartyRoles.map((role) => {
                  const parties = partiesByRole.get(role) ?? []
                  return parties.map((party) => {
                    const linkedContacts = contactsByParty.get(party.code) ?? []
                    const partyPhoneHref = telHref(party.phone)
                    return (
                      <TableRow key={`${role}-${party.code}`}>
                        <TableCell className="font-medium text-foreground">{role}</TableCell>
                        <TableCell className="font-medium text-foreground">
                          <div className="space-y-1">
                            <p>{party.name}</p>
                            {party.organization && party.organization !== party.name && (
                              <p className="text-sm text-muted-foreground">{party.organization}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{party.contactPerson || '—'}</TableCell>
                        <TableCell>
                          {party.email ? (
                            <a className="hover:text-foreground" href={`mailto:${party.email}`}>
                              {party.email}
                            </a>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          {partyPhoneHref ? (
                            <a className="hover:text-foreground" href={partyPhoneHref}>
                              {party.phone}
                            </a>
                          ) : (
                            party.phone || '—'
                          )}
                        </TableCell>
                        <TableCell>{party.address || '—'}</TableCell>
                        <TableCell>{party.abn || '—'}</TableCell>
                        <TableCell>
                          {linkedContacts.length === 0 ? (
                            <span className="text-muted-foreground">No contact recorded</span>
                          ) : (
                            <div className="space-y-1 text-sm leading-5">
                              {linkedContacts.map((contact) => {
                                const phoneHref = telHref(contact.phone)
                                const mobileHref = telHref(contact.mobile)
                                return (
                                  <div key={contact.slug} className="space-y-0.5">
                                    <p className="font-medium text-foreground">{contact.name}</p>
                                    <div className="flex flex-wrap gap-2 text-muted-foreground">
                                      {contact.email && (
                                        <a className="hover:text-foreground" href={`mailto:${contact.email}`}>
                                          {contact.email}
                                        </a>
                                      )}
                                      {phoneHref && (
                                        <a className="hover:text-foreground" href={phoneHref}>
                                          {contact.phone}
                                        </a>
                                      )}
                                      {mobileHref && (
                                        <a className="hover:text-foreground" href={mobileHref}>
                                          {contact.mobile}
                                        </a>
                                      )}
                                    </div>
                                    {contact.notes && (
                                      <p className="text-muted-foreground">{contact.notes}</p>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="space-y-6 pl-10">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Contact directory</h2>
            <p className="text-sm text-muted-foreground">
              Every individual mentioned in the documents is captured below, grouped by role category.
            </p>
          </div>
        </div>
        {contactSections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contacts recorded yet.</p>
        ) : (
          contactSections.map(({ category, contacts }) => (
            <div key={category} className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                {CONTACT_CATEGORY_LABELS[category]}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({contacts.length} contact{contacts.length === 1 ? '' : 's'})
                </span>
              </h3>
              <div className="overflow-x-auto rounded-lg border bg-background">
                <Table className="text-sm [&_*]:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[12rem]">Name</TableHead>
                      <TableHead className="min-w-[12rem]">Role / title</TableHead>
                      <TableHead className="min-w-[14rem]">Organisation</TableHead>
                      <TableHead className="min-w-[14rem]">Email</TableHead>
                      <TableHead className="min-w-[10rem]">Phone</TableHead>
                      <TableHead className="min-w-[14rem]">Address</TableHead>
                      <TableHead className="min-w-[12rem]">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => {
                      const phoneHref = telHref(contact.phone)
                      const mobileHref = telHref(contact.mobile)
                      const party = contact.partyCode ? partyByCode.get(contact.partyCode) : undefined
                      return (
                        <TableRow key={contact.slug}>
                          <TableCell className="font-medium text-foreground">{contact.name}</TableCell>
                          <TableCell>{contact.roleTitle || <span className="text-muted-foreground">—</span>}</TableCell>
                          <TableCell>
                            <p>{contact.organization || party?.name || <span className="text-muted-foreground">—</span>}</p>
                          </TableCell>
                          <TableCell>
                            {contact.email ? (
                              <a className="hover:text-foreground" href={`mailto:${contact.email}`}>
                                {contact.email}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="space-y-1">
                            {phoneHref && (
                              <a className="block hover:text-foreground" href={phoneHref}>
                                {contact.phone}
                              </a>
                            )}
                            {mobileHref && (
                              <a className="block hover:text-foreground" href={mobileHref}>
                                {contact.mobile}
                              </a>
                            )}
                            {!phoneHref && !mobileHref && (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {contact.address ? (
                              <p className="text-xs text-muted-foreground">{contact.address}</p>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>{contact.notes || <span className="text-muted-foreground">—</span>}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-6 pl-10">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Project identifiers</h2>
            <p className="text-sm text-muted-foreground">
              Formal identifiers grouped by issuing party to support document control and register alignment.
            </p>
          </div>
        </div>
        {sortedIdentifiers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No identifiers captured yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-background">
            <Table className="text-sm [&_*]:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[12rem]">Code type</TableHead>
                  <TableHead className="min-w-[14rem]">Identifier</TableHead>
                  <TableHead className="min-w-[14rem]">Issued by</TableHead>
                  <TableHead className="min-w-[12rem]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedIdentifiers.map((identifier) => {
                  const issuingParty = identifier.issuingPartyCode
                    ? partyByCode.get(identifier.issuingPartyCode)
                    : undefined
                  return (
                    <TableRow key={identifier.code}>
                      <TableCell className="font-medium text-foreground">{identifier.codeType}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{identifier.identifier}</p>
                          <p className="text-sm text-muted-foreground">Node code: {identifier.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {issuingParty ? issuingParty.name : identifier.issuingPartyCode || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>{identifier.notes || <span className="text-muted-foreground">—</span>}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </article>
  )
}
