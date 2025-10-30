'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LotRegisterTable from '@/components/features/lot/LotRegisterTable'

export function LotRegisterTableWrapper({ projectId }: { projectId: string }) {
  return (
    <Tabs defaultValue="wbs" className="w-full">
      <TabsList>
        <TabsTrigger value="wbs">WBS View</TabsTrigger>
        <TabsTrigger value="lbs">LBS View</TabsTrigger>
      </TabsList>

      <TabsContent value="wbs">
        <LotRegisterTable projectId={projectId} viewMode="wbs" />
      </TabsContent>

      <TabsContent value="lbs">
        <LotRegisterTable projectId={projectId} viewMode="lbs" />
      </TabsContent>
    </Tabs>
  )
}


