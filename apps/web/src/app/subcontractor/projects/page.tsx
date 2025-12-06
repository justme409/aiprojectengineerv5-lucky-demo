'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Briefcase, ClipboardCheck, FileText, Search } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description?: string;
    status?: string;
    activeLots: number;
    pendingInspections: number;
}

export default function SubcontractorProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/v1/subcontractor/projects', {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setProjects(data.projects || []);
                } else if (response.status === 401) {
                    console.error('Authentication required');
                    setProjects([]);
                } else {
                    console.error('Failed to fetch projects');
                    setProjects([]);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Badge variant="outline" className="px-3 py-1">
                    {projects.length} Projects Assigned
                </Badge>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-blue-500" />
                            Active Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{projects.length}</p>
                        <p className="text-xs text-muted-foreground">Currently assigned</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-500" />
                            Active Lots
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {projects.reduce((sum, p) => sum + p.activeLots, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Work packages in progress</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <ClipboardCheck className="h-4 w-4 text-orange-500" />
                            Pending Inspections
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {projects.reduce((sum, p) => sum + p.pendingInspections, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Awaiting inspection</p>
                    </CardContent>
                </Card>
            </div>

            {/* Projects List */}
            {filteredProjects.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'No Matching Projects' : 'No Projects Assigned'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm
                                ? 'Try a different search term.'
                                : 'You have not been assigned to any projects yet. Contact your project manager.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-lg">{project.name}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {project.description || 'No description'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Active Lots</span>
                                    <Badge variant="secondary">{project.activeLots}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Pending Inspections</span>
                                    <Badge variant={project.pendingInspections > 0 ? 'default' : 'outline'}>
                                        {project.pendingInspections}
                                    </Badge>
                                </div>
                                <Button asChild className="w-full">
                                    <Link href={`/subcontractor/projects/${project.id}`}>
                                        Open Project
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
