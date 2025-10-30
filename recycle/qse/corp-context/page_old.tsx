'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building, Users, TrendingUp, AlertTriangle, Target } from 'lucide-react'

export default function CorpContextPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Building className="w-12 h-12 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Context of Organization</h1>
            <p className="text-xl text-gray-600 mt-2">Understanding Internal & External Context</p>
          </div>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Define and understand the internal and external context of your organization,
          including interested parties and their requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span>Internal Context</span>
            </CardTitle>
            <CardDescription>
              Governance, organizational structure, capabilities, and culture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>External Context</span>
            </CardTitle>
            <CardDescription>
              Market conditions, regulatory environment, and competitive landscape
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Interested Parties</span>
            </CardTitle>
            <CardDescription>
              Stakeholders, customers, suppliers, and regulatory bodies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-600" />
              <span>Needs & Expectations</span>
            </CardTitle>
            <CardDescription>
              Requirements and expectations of interested parties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Risks & Opportunities</span>
            </CardTitle>
            <CardDescription>
              SWOT analysis and strategic risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-indigo-600" />
              <span>Scope Definition</span>
            </CardTitle>
            <CardDescription>
              QSE management system scope and boundaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-8 border-t">
        <p className="text-gray-600">
          This module is under development • Contact QSE team for implementation timeline
        </p>
      </div>
    </div>
  )
}
