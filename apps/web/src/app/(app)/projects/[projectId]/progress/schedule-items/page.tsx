import { Suspense } from 'react';
import { ScheduleItemNode, SCHEDULE_ITEM_QUERIES } from '@/schemas/neo4j/schedule-item.schema';
import { neo4jClient } from '@/lib/neo4j';
import { ScheduleItemsTable } from '@/components/progress/schedule-items-table';
import { ScheduleItemsTableSkeleton } from '@/components/progress/schedule-items-table-skeleton';
import { CreateScheduleItemButton } from '@/components/progress/create-schedule-item-button';

/**
 * Schedule Items Register Page
 * 
 * Displays all contract schedule items for a project.
 * Schedule items form the basis for progress claims and payments.
 */

interface PageProps {
  params: { projectId: string };
}

async function getScheduleItems(projectId: string): Promise<ScheduleItemNode[]> {
  try {
    const items = await neo4jClient.read<ScheduleItemNode>(
      SCHEDULE_ITEM_QUERIES.getAllItems,
      { projectId }
    );
    return items;
  } catch (error) {
    console.error('Failed to fetch schedule items:', error);
    return [];
  }
}

async function ScheduleItemsContent({ projectId }: { projectId: string }) {
  const items = await getScheduleItems(projectId);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule of Rates</h1>
          <p className="text-muted-foreground mt-2">
            Contract schedule items for progress claims and payment
          </p>
        </div>
        <CreateScheduleItemButton projectId={projectId} />
      </div>
      
      <ScheduleItemsTable items={items} projectId={projectId} />
      
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No schedule items found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add schedule items from the contract schedule of rates
          </p>
        </div>
      )}
    </div>
  );
}

export default function ScheduleItemsPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<ScheduleItemsTableSkeleton />}>
        <ScheduleItemsContent projectId={params.projectId} />
      </Suspense>
    </div>
  );
}

