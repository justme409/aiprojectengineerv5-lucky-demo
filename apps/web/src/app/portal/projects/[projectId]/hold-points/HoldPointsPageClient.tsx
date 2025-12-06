'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface HoldPoint {
    id: string;
    lotNumber: string;
    lotDescription: string;
    templateDocNo: string;
    inspectionPointId: string;
    pointSequence: number;
    pointDescription: string;
    requirement: string;
    requestedAt: string;
    requestedBy: string;
    slaDueAt?: string;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
}

interface HoldPointsPageClientProps {
    projectId: string;
    projectName?: string;
}

export default function HoldPointsPageClient({ projectId, projectName }: HoldPointsPageClientProps) {
    const [holdPoints, setHoldPoints] = useState<HoldPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPoint, setSelectedPoint] = useState<HoldPoint | null>(null);
    const [releaseComment, setReleaseComment] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchHoldPoints = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v1/projects/${projectId}/quality/hold-witness?type=hold&status=pending`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setHoldPoints(data.points || []);
            } else {
                console.error('Failed to fetch hold points');
                setHoldPoints([]);
            }
        } catch (error) {
            console.error('Error fetching hold points:', error);
            setHoldPoints([]);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchHoldPoints();
    }, [fetchHoldPoints]);

    const handleRelease = async (action: 'approve' | 'reject') => {
        if (!selectedPoint) return;

        try {
            setActionLoading(true);
            const response = await fetch(`/api/v1/projects/${projectId}/quality/hold-witness`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    inspectionPointId: selectedPoint.inspectionPointId,
                    action: action === 'approve' ? 'release' : 'reject',
                    comment: releaseComment,
                }),
            });

            if (response.ok) {
                setIsDialogOpen(false);
                setSelectedPoint(null);
                setReleaseComment('');
                fetchHoldPoints();
            } else {
                console.error('Failed to release hold point');
            }
        } catch (error) {
            console.error('Error releasing hold point:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const getTimeRemaining = (slaDueAt?: string) => {
        if (!slaDueAt) return null;

        const due = new Date(slaDueAt);
        const now = new Date();
        const diffMs = due.getTime() - now.getTime();
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));

        if (diffHours < 0) {
            return { text: `${Math.abs(diffHours)}h overdue`, isOverdue: true };
        } else if (diffHours < 24) {
            return { text: `${diffHours}h remaining`, isUrgent: true };
        } else {
            const diffDays = Math.round(diffHours / 24);
            return { text: `${diffDays}d remaining`, isUrgent: false };
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/portal/projects/${projectId}/dashboard`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hold Points</h1>
                    <p className="text-gray-600 mt-1">
                        {projectName || 'Project'} - Review and release hold points requiring client approval
                    </p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                    {holdPoints.length} Pending
                </Badge>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            Pending Release
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{holdPoints.length}</p>
                        <p className="text-xs text-muted-foreground">Awaiting your decision</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Urgent
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {holdPoints.filter(hp => {
                                const time = getTimeRemaining(hp.slaDueAt);
                                return time?.isOverdue || time?.isUrgent;
                            }).length}
                        </p>
                        <p className="text-xs text-muted-foreground">Due within 24 hours or overdue</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Affected Lots
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {new Set(holdPoints.map(hp => hp.lotNumber)).size}
                        </p>
                        <p className="text-xs text-muted-foreground">Work packages on hold</p>
                    </CardContent>
                </Card>
            </div>

            {/* Hold Points Table */}
            {holdPoints.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Hold Points</h3>
                        <p className="text-gray-500">All hold points have been reviewed. Check back later for new ones.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Hold Points</CardTitle>
                        <CardDescription>
                            Click on a hold point to review details and release for work to continue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lot</TableHead>
                                    <TableHead>Inspection Point</TableHead>
                                    <TableHead>Requested</TableHead>
                                    <TableHead>SLA</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {holdPoints.map((point) => {
                                    const timeRemaining = getTimeRemaining(point.slaDueAt);

                                    return (
                                        <TableRow key={point.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{point.lotNumber}</p>
                                                    <p className="text-sm text-muted-foreground">{point.lotDescription}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">Point {point.pointSequence}</p>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {point.pointDescription || point.requirement}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm">{point.requestedBy}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(point.requestedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {timeRemaining ? (
                                                    <Badge
                                                        variant={timeRemaining.isOverdue ? 'destructive' : timeRemaining.isUrgent ? 'secondary' : 'outline'}
                                                    >
                                                        {timeRemaining.text}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Dialog open={isDialogOpen && selectedPoint?.id === point.id} onOpenChange={(open) => {
                                                    setIsDialogOpen(open);
                                                    if (!open) {
                                                        setSelectedPoint(null);
                                                        setReleaseComment('');
                                                    }
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedPoint(point);
                                                                setIsDialogOpen(true);
                                                            }}
                                                        >
                                                            Review
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-lg">
                                                        <DialogHeader>
                                                            <DialogTitle>Release Hold Point</DialogTitle>
                                                            <DialogDescription>
                                                                Review and release this hold point to allow work to continue.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="text-sm font-medium">Lot</label>
                                                                <p className="text-sm text-muted-foreground">{point.lotNumber} - {point.lotDescription}</p>
                                                            </div>

                                                            <div>
                                                                <label className="text-sm font-medium">Requirement</label>
                                                                <p className="text-sm text-muted-foreground">{point.requirement}</p>
                                                            </div>

                                                            <div>
                                                                <label className="text-sm font-medium">Comment (optional)</label>
                                                                <Textarea
                                                                    placeholder="Add any comments for the release..."
                                                                    value={releaseComment}
                                                                    onChange={(e) => setReleaseComment(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <DialogFooter className="gap-2">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleRelease('reject')}
                                                                disabled={actionLoading}
                                                                className="text-red-600"
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleRelease('approve')}
                                                                disabled={actionLoading}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Release Hold Point
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
