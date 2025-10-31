'use client';

import { LotNode } from '@/schemas/neo4j/lot.schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CloseoutChecklistProps {
  lot: LotNode;
  projectId: string;
}

export function CloseoutChecklist({ lot, projectId }: CloseoutChecklistProps) {
  const checklistItems = [
    {
      id: 'status',
      label: 'Lot Status is Conformed',
      completed: lot.status === 'conformed' || lot.status === 'closed',
      required: true,
    },
    {
      id: 'complete',
      label: 'Work is 100% Complete',
      completed: lot.percentComplete === 100,
      required: true,
    },
    {
      id: 'conformed',
      label: 'Conformed Date Recorded',
      completed: !!lot.conformedDate,
      required: true,
    },
    {
      id: 'itps',
      label: 'All ITPs Completed and Approved',
      completed: false, // Would check ITP instances
      required: true,
    },
    {
      id: 'tests',
      label: 'All Test Results Approved',
      completed: false, // Would check test results
      required: true,
    },
    {
      id: 'ncrs',
      label: 'All NCRs Closed',
      completed: false, // Would check NCRs
      required: true,
    },
    {
      id: 'photos',
      label: 'Progress Photos Uploaded',
      completed: false, // Would check photos
      required: false,
    },
    {
      id: 'documents',
      label: 'Required Documents Uploaded',
      completed: false, // Would check documents
      required: false,
    },
  ];
  
  const requiredComplete = checklistItems.filter(i => i.required && i.completed).length;
  const requiredTotal = checklistItems.filter(i => i.required).length;
  const allRequiredComplete = requiredComplete === requiredTotal;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Closeout Checklist</CardTitle>
          <CardDescription>
            Complete all required items before closing this lot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : item.required ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <div className="font-medium">{item.label}</div>
                  {item.required && (
                    <div className="text-xs text-muted-foreground">Required</div>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {item.completed ? 'Complete' : 'Pending'}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Progress Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Required Items</span>
                <span className="text-sm font-medium">
                  {requiredComplete} / {requiredTotal}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(requiredComplete / requiredTotal) * 100}%` }}
                />
              </div>
            </div>
            
            {allRequiredComplete && lot.status !== 'closed' ? (
              <Button className="w-full" size="lg">
                Close Lot
              </Button>
            ) : lot.status === 'closed' ? (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-900">Lot Closed</p>
              </div>
            ) : (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Complete all required items to close this lot
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

