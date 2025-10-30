import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

const migrations: Array<{ from: RegExp, to: (match: RegExpMatchArray) => string }> = [
	{ from: /^\/login$/, to: () => '/auth/login' },
	{ from: /^\/subscription-required$/, to: () => '/auth/subscription/required' },
	{ from: /^\/subscription-sync$/, to: () => '/auth/subscription/sync' },
	{ from: /^\/account$/, to: () => '/app/account' },
	{ from: /^\/projects$/, to: () => '/app/projects' },
	{ from: /^\/projects\/([^/]+)$/, to: (m) => `/app/projects/${m[1]}/overview` },
	{ from: /^\/projects\/([^/]+)\/documents$/, to: (m) => `/app/projects/${m[1]}/documents` },
	{ from: /^\/projects\/([^/]+)\/wbs$/, to: (m) => `/app/projects/${m[1]}/wbs` },
	{ from: /^\/projects\/([^/]+)\/lots$/, to: (m) => `/app/projects/${m[1]}/lbs` },
	{ from: /^\/projects\/([^/]+)\/itp-templates$/, to: (m) => `/app/projects/${m[1]}/quality/itp-templates-register` },
	{ from: /^\/projects\/([^/]+)\/itp$/, to: (m) => `/app/projects/${m[1]}/quality/itp` },
	{ from: /^\/projects\/([^/]+)\/details$/, to: (m) => `/app/projects/${m[1]}/settings` },
	{ from: /^\/projects\/([^/]+)\/quality\/lots$/, to: (m) => `/app/projects/${m[1]}/quality/lots` },
	{ from: /^\/projects\/([^/]+)\/quality\/hold-witness$/, to: (m) => `/app/projects/${m[1]}/quality/hold-witness` },
	{ from: /^\/projects\/([^/]+)\/quality\/itp$/, to: (m) => `/app/projects/${m[1]}/quality/lot-register` },
	{ from: /^\/projects\/([^/]+)\/quality\/records$/, to: (m) => `/app/projects/${m[1]}/quality/records` },
	{ from: /^\/projects\/([^/]+)\/quality\/primary-testing$/, to: (m) => `/app/projects/${m[1]}/quality/primary-testing` },
	{ from: /^\/projects\/([^/]+)\/inspections$/, to: (m) => `/app/projects/${m[1]}/inspections` },
	{ from: /^\/projects\/([^/]+)\/inspections\/([^/]+)$/, to: (m) => `/app/projects/${m[1]}/inspections/${m[2]}` },
	{ from: /^\/projects\/([^/]+)\/materials$/, to: (m) => `/app/projects/${m[1]}/materials` },
	{ from: /^\/projects\/([^/]+)\/mix-designs$/, to: (m) => `/app/projects/${m[1]}/mix-designs` },
	{ from: /^\/projects\/([^/]+)\/certificates$/, to: (m) => `/app/projects/${m[1]}/certificates` },
	{ from: /^\/projects\/([^/]+)\/tests$/, to: (m) => `/app/projects/${m[1]}/tests` },
	{ from: /^\/projects\/([^/]+)\/samples$/, to: (m) => `/app/projects/${m[1]}/samples` },
	{ from: /^\/projects\/([^/]+)\/methods$/, to: (m) => `/app/projects/${m[1]}/methods` },
	{ from: /^\/projects\/([^/]+)\/lots\/([^/]+)\/closeout$/, to: (m) => `/app/projects/${m[1]}/lots/${m[2]}/closeout` },
	{ from: /^\/projects\/([^/]+)\/hse\/swms$/, to: (m) => `/app/projects/${m[1]}/hse/swms` },
	{ from: /^\/projects\/([^/]+)\/hse\/permits$/, to: (m) => `/app/projects/${m[1]}/hse/permits` },
	{ from: /^\/projects\/([^/]+)\/hse\/toolbox-talks$/, to: (m) => `/app/projects/${m[1]}/hse/toolbox-talks` },
	{ from: /^\/projects\/([^/]+)\/hse\/safety-walks$/, to: (m) => `/app/projects/${m[1]}/hse/safety-walks` },
	{ from: /^\/projects\/([^/]+)\/hse\/inductions$/, to: (m) => `/app/projects/${m[1]}/hse/inductions` },
	{ from: /^\/projects\/([^/]+)\/hse\/incidents$/, to: (m) => `/app/projects/${m[1]}/hse/incidents` },
	{ from: /^\/projects\/([^/]+)\/hse\/capa$/, to: (m) => `/app/projects/${m[1]}/hse/capa` },
	{ from: /^\/projects\/([^/]+)\/daily-diaries$/, to: (m) => `/app/projects/${m[1]}/field/daily-diaries` },
	{ from: /^\/projects\/([^/]+)\/site-instructions$/, to: (m) => `/app/projects/${m[1]}/field/site-instructions` },
	{ from: /^\/projects\/([^/]+)\/timesheets$/, to: (m) => `/app/projects/${m[1]}/field/timesheets` },
	{ from: /^\/projects\/([^/]+)\/roster$/, to: (m) => `/app/projects/${m[1]}/field/roster` },
	{ from: /^\/projects\/([^/]+)\/plant$/, to: (m) => `/app/projects/${m[1]}/field/plant` },
	{ from: /^\/projects\/([^/]+)\/approvals\/designer$/, to: (m) => `/app/projects/${m[1]}/approvals/designer` },
	{ from: /^\/projects\/([^/]+)\/approvals\/inbox$/, to: (m) => `/app/projects/${m[1]}/approvals/inbox` },
	{ from: /^\/projects\/([^/]+)\/inbox$/, to: (m) => `/app/projects/${m[1]}/inbox` },
	{ from: /^\/projects\/([^/]+)\/map$/, to: (m) => `/app/projects/${m[1]}/map` },
	{ from: /^\/projects\/([^/]+)\/reports$/, to: (m) => `/app/projects/${m[1]}/reports` },
	{ from: /^\/portal\/([^/]+)\/dashboard$/, to: (m) => `/portal/projects/${m[1]}/dashboard` },
	{ from: /^\/portal\/([^/]+)\/details$/, to: (m) => `/portal/projects/${m[1]}/details` },
	{ from: /^\/portal\/([^/]+)\/documents$/, to: (m) => `/portal/projects/${m[1]}/documents` },
	{ from: /^\/portal\/([^/]+)\/itp-templates$/, to: (m) => `/portal/projects/${m[1]}/itp-templates` },
	{ from: /^\/portal\/([^/]+)\/lots$/, to: (m) => `/portal/projects/${m[1]}/lots` },
	{ from: /^\/portal\/([^/]+)\/ncrs$/, to: (m) => `/portal/projects/${m[1]}/ncrs` },
	{ from: /^\/portal\/([^/]+)\/pending-approvals$/, to: (m) => `/portal/projects/${m[1]}/pending-approvals` },
	{ from: /^\/portal\/([^/]+)\/management-plans$/, to: (m) => `/portal/projects/${m[1]}/management-plans` },
	{ from: /^\/portal\/([^/]+)\/wbs$/, to: (m) => `/portal/projects/${m[1]}/wbs` },
]

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl

	// Handle redirects first
	for (const m of migrations) {
		const match = pathname.match(m.from)
		if (match) {
			const to = m.to(match)
			return NextResponse.redirect(new URL(to, req.url))
		}
	}

	// Auth and subscription checks for protected routes
	const protectedRoutes = ['/app', '/portal']
	const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

	if (isProtected) {
		const session = await auth()
		if (!session) {
			return NextResponse.redirect(new URL('/auth/login', req.url))
		}

		// Check subscription status via project_feature_flags
		try {
			const userId = session.user?.id
			if (userId) {
				const subscriptionResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/billing/subscription-status?user_id=${userId}&project_id=${req.nextUrl.pathname.split('/')[3] || ''}`)
				const subscriptionData = await subscriptionResponse.json()
				if (!subscriptionData.active) {
					return NextResponse.redirect(new URL('/auth/subscription/required', req.url))
				}
			}
		} catch (error) {
			// If subscription check fails, allow access (fail open for now)
			console.error('Subscription check failed:', error)
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|_next/webpack-hmr|api/auth).*)'],
}
