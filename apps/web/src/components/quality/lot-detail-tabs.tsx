'use client';

import { LotWithRelationships } from '@/schemas/neo4j/lot.schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, TestTube, Package, Image, BarChart3 } from 'lucide-react';

interface LotDetailTabsProps {
  lot: LotWithRelationships;
  projectId: string;
}

export function LotDetailTabs({ lot, projectId }: LotDetailTabsProps) {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="itps">
          ITPs
          {lot.itpInstances && lot.itpInstances.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {lot.itpInstances.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="ncrs">
          NCRs
          {lot.ncrs && lot.ncrs.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {lot.ncrs.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="tests">
          Tests
          {lot.tests && lot.tests.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {lot.tests.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="materials">
          Materials
          {lot.materials && lot.materials.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {lot.materials.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="quantities">Quantities</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Lot Information</CardTitle>
            <CardDescription>Detailed information about this lot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Lot Number</div>
                <div className="text-lg">{lot.number}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <div className="text-lg capitalize">{lot.status.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Work Type</div>
                <div className="text-lg">{lot.workType}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Area Code</div>
                <div className="text-lg">{lot.areaCode}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Start Chainage</div>
                <div className="text-lg">{lot.startChainage}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">End Chainage</div>
                <div className="text-lg">{lot.endChainage}</div>
              </div>
            </div>
            
            {lot.notes && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Notes</div>
                <div className="p-3 bg-muted rounded-md">{lot.notes}</div>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <div className="text-sm font-medium text-muted-foreground mb-2">Progress</div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${lot.percentComplete}%` }}
                    />
                  </div>
                </div>
                <div className="text-lg font-semibold">{lot.percentComplete}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="itps" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Inspection and Test Plans
            </CardTitle>
            <CardDescription>
              ITP instances implemented for this lot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!lot.itpInstances || lot.itpInstances.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No ITP instances found for this lot</p>
                <Button className="mt-4" variant="outline">
                  Create ITP Instance
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {lot.itpInstances.map((itp: any) => (
                  <div
                    key={itp.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{itp.templateId}</div>
                      <div className="text-sm text-muted-foreground">
                        Status: {itp.status}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="ncrs" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Non-Conformance Reports
            </CardTitle>
            <CardDescription>
              Quality issues and non-conformances for this lot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!lot.ncrs || lot.ncrs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No NCRs found for this lot</p>
                <p className="text-sm mt-2">This is good - no quality issues reported!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lot.ncrs.map((ncr: any) => (
                  <div
                    key={ncr.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ncr.number}</span>
                        <Badge
                          variant={
                            ncr.severity === 'critical'
                              ? 'destructive'
                              : ncr.severity === 'major'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {ncr.severity}
                        </Badge>
                        <Badge variant="outline">{ncr.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {ncr.description}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="tests" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Requests
            </CardTitle>
            <CardDescription>
              Laboratory tests and results for this lot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!lot.tests || lot.tests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test requests found for this lot</p>
                <Button className="mt-4" variant="outline">
                  Request Test
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {lot.tests.map((test: any) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{test.number}</div>
                      <div className="text-sm text-muted-foreground">
                        {test.testType} - {test.status}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Results
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="materials" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Materials
            </CardTitle>
            <CardDescription>
              Materials used in this lot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!lot.materials || lot.materials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No materials linked to this lot</p>
                <Button className="mt-4" variant="outline">
                  Link Material
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {lot.materials.map((material: any) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{material.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {material.type} - {material.supplier}
                      </div>
                    </div>
                    <Badge variant={material.approvalStatus === 'approved' ? 'outline' : 'secondary'} className={material.approvalStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-300' : ''}>
                      {material.approvalStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="quantities" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quantities
            </CardTitle>
            <CardDescription>
              Schedule item quantities for progress claims
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!lot.quantities || lot.quantities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No quantities defined for this lot</p>
                <Button className="mt-4" variant="outline">
                  Add Quantity
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {lot.quantities.map((qty: any) => (
                  <div
                    key={qty.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium">Schedule Item: {qty.scheduleItemId}</div>
                      <div className="text-sm text-muted-foreground">
                        {qty.quantity} {qty.unit} - {qty.percentComplete}% complete
                      </div>
                    </div>
                    <Badge variant="outline">{qty.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

