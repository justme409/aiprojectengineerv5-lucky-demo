'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, ClipboardCheck, AlertCircle, Calendar } from 'lucide-react';

interface LotSummary {
    id: string;
    number: string;
    description: string;
    status: 'open' | 'in_progress' | 'conformed' | 'closed';
    percentComplete: number;
    templateDocNo?: string;
    pendingInspections: number;
}

interface ProjectDashboardData {
    project: {
        id: string;
        name: string;
        description?: string;
    };
    lots: LotSummary[];
    stats: {
        totalLots: number;
        inProgressLots: number;
        completedLots: number;
        pendingInspections: number;
    };
}

export default function SubcontractorProjectPage() {
    const params = useParams();
    const projectId = params?.projectId as string;

    const [data, setData] = useState<ProjectDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                // Fetch project details
                const projectRes = await fetch(`/api/v1/projects/${projectId}`, {
                    credentials: 'include',
                });

                if (!projectRes.ok) {
                    if (projectRes.status === 404) notFound();
                    throw new Error('Failed to fetch project');
                }

                const projectData = await projectRes.json();

                // Fetch subcontractor's lots
                const lotsRes = await fetch(`/api/v1/subcontractor/projects/${projectId}/lots`, {
                    credentials: 'include',
                });

                const lotsData = lotsRes.ok ? await lotsRes.json() : { lots: [] };
                const lots: LotSummary[] = lotsData.lots || [];

                // Calculate stats
                const stats = {
                    totalLots: lots.length,
                    inProgressLots: lots.filter(l => l.status === 'in_progress').length,
                    completedLots: lots.filter(l => l.status === 'conformed' || l.status === 'closed').length,
                    pendingInspections: lots.reduce((sum, l) => sum + (l.pendingInspections || 0), 0),
                };

                setData({
                    project: projectData.project || projectData,
                    lots,
                    stats,
                });
            } catch (error) {
                console.error('Error fetching project:', error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchProjectData();
        }
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) {
        return notFound();
    }

    const { project, lots, stats } = data;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'conformed': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/subcontractor/projects">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        All Projects
                    </Button>
                </Link>
            </div>

            <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <p className="text-muted-foreground">{project.description || 'Project Dashboard'}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            My Lots
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.totalLots}</p>
                        <p className="text-xs text-muted-foreground">Assigned to you</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-yellow-500" />
                            In Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.inProgressLots}</p>
                        <p className="text-xs text-muted-foreground">Active work packages</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <ClipboardCheck className="h-4 w-4 text-green-500" />
                            Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.completedLots}</p>
                        <p className="text-xs text-muted-foreground">Conformed lots</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            Pending Inspections
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.pendingInspections}</p>
                        <p className="text-xs text-muted-foreground">Awaiting review</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
                <Button asChild>
                    <Link href={`/subcontractor/projects/${projectId}/lots`}>
                        View All Lots
                    </Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href={`/subcontractor/projects/${projectId}/inspection-requests`}>
                        Inspection Requests
                    </Link>
                </Button>
            </div>

            {/* Recent Lots */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Lots</CardTitle>
                    <CardDescription>Your most recently active work packages</CardDescription>
                </CardHeader>
                <CardContent>
                    {lots.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="mx-auto h-8 w-8 mb-2" />
                            <p>No lots assigned yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lots.slice(0, 5).map((lot) => (
                                <div key={lot.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{lot.number}</span>
                                            <Badge className={getStatusColor(lot.status)}>
                                                {lot.status.replace('_', ' ')}
                                            </Badge>
                                            {lot.pendingInspections > 0 && (
                                                <Badge variant="outline" className="text-orange-600">
                                                    {lot.pendingInspections} pending
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{lot.description}</p>
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <Progress value={lot.percentComplete} className="h-2 flex-1" />
                                                <span className="text-xs text-muted-foreground">{lot.percentComplete}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/subcontractor/projects/${projectId}/lots/${lot.id}`}>
                                            Open
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
