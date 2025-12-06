'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Search, FileText, ClipboardCheck } from 'lucide-react';

interface Lot {
    id: string;
    number: string;
    description: string;
    status: 'open' | 'in_progress' | 'conformed' | 'closed';
    percentComplete: number;
    workType: string;
    templateDocNo?: string;
    areaCode?: string;
    startDate?: string;
    pendingInspections: number;
    completedInspections: number;
    totalInspections: number;
}

export default function SubcontractorLotsPage() {
    const params = useParams();
    const projectId = params?.projectId as string;

    const [lots, setLots] = useState<Lot[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        const fetchLots = async () => {
            try {
                const response = await fetch(`/api/v1/subcontractor/projects/${projectId}/lots`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setLots(data.lots || []);
                } else {
                    console.error('Failed to fetch lots');
                }
            } catch (error) {
                console.error('Error fetching lots:', error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchLots();
        }
    }, [projectId]);

    const filteredLots = lots.filter(lot => {
        const matchesSearch =
            lot.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lot.workType.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || lot.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'conformed': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/subcontractor/projects/${projectId}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">My Work Lots</h1>
                    <p className="text-muted-foreground">Construction work packages assigned to you</p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                    {lots.length} Lots
                </Badge>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by lot number, description, or work type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="conformed">Conformed</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Lots Table */}
            {filteredLots.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || statusFilter !== 'all' ? 'No Matching Lots' : 'No Lots Assigned'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your filters.'
                                : 'You have not been assigned any lots on this project.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lot</TableHead>
                                    <TableHead>Work Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Inspections</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLots.map((lot) => (
                                    <TableRow key={lot.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{lot.number}</p>
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {lot.description}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{lot.workType}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(lot.status)}>
                                                {lot.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 min-w-32">
                                                <Progress value={lot.percentComplete} className="h-2 flex-1" />
                                                <span className="text-xs text-muted-foreground w-10">
                                                    {lot.percentComplete}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {lot.completedInspections}/{lot.totalInspections}
                                                </span>
                                                {lot.pendingInspections > 0 && (
                                                    <Badge variant="outline" className="text-orange-600 text-xs">
                                                        {lot.pendingInspections} pending
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" asChild>
                                                <Link href={`/subcontractor/projects/${projectId}/lots/${lot.id}`}>
                                                    Work
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
