'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Target, Eye, MessageSquare, CheckCircle } from 'lucide-react'

export default function CorpLeadershipPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Users className="w-12 h-12 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Leadership & Commitment</h1>
            <p className="text-xl text-gray-600 mt-2">Management Leadership and Organizational Culture</p>
          </div>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Demonstrate leadership and commitment to the QSE management system,
          promote a culture of quality, safety, and environmental responsibility.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Leadership Commitment</span>
            </CardTitle>
            <CardDescription>
              Top management commitment and accountability for QSE performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span>QSE Policy</span>
            </CardTitle>
            <CardDescription>
              Establishment and communication of QSE policy and objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <span>Organizational Roles</span>
            </CardTitle>
            <CardDescription>
              Define roles, responsibilities, and authorities for QSE management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              <span>Culture & Awareness</span>
            </CardTitle>
            <CardDescription>
              Promote QSE culture and awareness throughout the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-red-600" />
              <span>Resource Provision</span>
            </CardTitle>
            <CardDescription>
              Ensure adequate resources for establishing and maintaining QSE system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Management Review</span>
            </CardTitle>
            <CardDescription>
              Regular review of QSE system performance by top management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-8 border-t">
        <p className="text-gray-600">
          Leadership commitment is the foundation of an effective QSE system
        </p>
      </div>
    </div>
  )
}
