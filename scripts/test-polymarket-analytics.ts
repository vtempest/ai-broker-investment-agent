#!/usr/bin/env tsx

/**
 * Test script for Polymarket Analytics API endpoints
 *
 * Usage:
 *   npm run test:polymarket-analytics
 *   or
 *   tsx scripts/test-polymarket-analytics.ts [eventId]
 */

import {
  fetchMarketSummary,
  fetchMarketsDashboard,
  searchPublic,
} from '../packages/investing/src/prediction/polymarket'

const DEFAULT_EVENT_ID = '23656'

async function testMarketSummary(eventId: string) {
  console.log(`\n📊 Testing Market Summary API for event ${eventId}...`)
  try {
    const summary = await fetchMarketSummary(eventId)
    console.log('✅ Market Summary Response:')
    console.log(JSON.stringify(summary, null, 2))
    return summary
  } catch (error: any) {
    console.error('❌ Market Summary Error:', error.message)
    throw error
  }
}

async function testMarketsDashboard(eventId: string) {
  console.log(`\n📈 Testing Markets Dashboard API for event ${eventId}...`)
  try {
    const dashboard = await fetchMarketsDashboard(eventId)
    console.log('✅ Markets Dashboard Response:')
    console.log(JSON.stringify(dashboard, null, 2))
    return dashboard
  } catch (error: any) {
    console.error('❌ Markets Dashboard Error:', error.message)
    throw error
  }
}

async function testCombinedWorkflow() {
  console.log('\n🔍 Testing Combined Workflow...')
  console.log('Step 1: Search for high-volume markets')

  try {
    // Search for trending markets
    const searchResult = await searchPublic({
      q: 'trump',
      limit_per_type: 5,
      events_status: 'active',
    })

    console.log('✅ Search completed')

    // Extract event IDs from search results
    const events = searchResult?.events || []
    if (events.length === 0) {
      console.log('⚠️  No events found in search results')
      return
    }

    const firstEvent = events[0]
    const eventId = firstEvent.id

    console.log(`\nStep 2: Analyze event "${firstEvent.title || firstEvent.question}"`)
    console.log(`Event ID: ${eventId}`)

    // Fetch analytics for the first event
    const [summary, dashboard] = await Promise.all([
      fetchMarketSummary(eventId),
      fetchMarketsDashboard(eventId),
    ])

    console.log('\n✅ Combined Analytics Retrieved:')
    console.log('\nSummary highlights:')
    console.log('  - Volume:', summary.volume || 'N/A')
    console.log('  - Liquidity:', summary.liquidity || 'N/A')
    console.log('  - Open Interest:', summary.openInterest || 'N/A')

    console.log('\nDashboard highlights:')
    console.log('  - Holders:', dashboard.holders?.length || 0)
    console.log('  - Chart data points:', dashboard.charts?.length || 0)

    if (dashboard.charts && dashboard.charts.length > 0) {
      const latest = dashboard.charts[dashboard.charts.length - 1]
      console.log('  - Latest price:', latest?.price || 'N/A')
    }

    return { summary, dashboard }
  } catch (error: any) {
    console.error('❌ Combined workflow error:', error.message)
    throw error
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('Polymarket Analytics API Test Suite')
  console.log('='.repeat(60))

  // Get event ID from command line args or use default
  const eventId = process.argv[2] || DEFAULT_EVENT_ID

  try {
    // Test 1: Market Summary
    await testMarketSummary(eventId)

    // Test 2: Markets Dashboard
    await testMarketsDashboard(eventId)

    // Test 3: Combined Workflow
    await testCombinedWorkflow()

    console.log('\n' + '='.repeat(60))
    console.log('✅ All tests passed successfully!')
    console.log('='.repeat(60))
  } catch (error: any) {
    console.log('\n' + '='.repeat(60))
    console.error('❌ Test suite failed:', error.message)
    console.log('='.repeat(60))
    process.exit(1)
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  main()
}

export { testMarketSummary, testMarketsDashboard, testCombinedWorkflow }
