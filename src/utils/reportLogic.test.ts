import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidStatusTransition,
  calculateReportStats,
  classifyUrgency,
  filterReports,
  getStatusBadgeConfig,
} from './reportLogic';
import { EmergencyReport } from '../types';

test('status transitions follow permitted flow', () => {
  assert.equal(isValidStatusTransition('NEW', 'ACKNOWLEDGED'), true);
  assert.equal(isValidStatusTransition('NEW', 'RESOLVED'), true);
  assert.equal(isValidStatusTransition('NEW', 'NEW'), true);
  assert.equal(isValidStatusTransition('ACKNOWLEDGED', 'RESOLVED'), true);
  assert.equal(isValidStatusTransition('ACKNOWLEDGED', 'NEW'), true);
  assert.equal(isValidStatusTransition('RESOLVED', 'ACKNOWLEDGED'), true);
  assert.equal(isValidStatusTransition('RESOLVED', 'NEW'), true);
});

test('calculateReportStats aggregates totals accurately', () => {
  const mockReports: EmergencyReport[] = [
    {
      id: '1',
      type: 'Medical',
      location: 'Library 3rd floor',
      description: 'Dizziness and fainting',
      status: 'NEW',
      urgency: 'High',
      submittedBy: 'user-1',
      createdAt: '2026-11-12T00:00:00Z',
    },
    {
      id: '2',
      type: 'Fire',
      location: 'Chemistry Lab B',
      description: 'Small smoke emission from hood',
      status: 'ACKNOWLEDGED',
      urgency: 'Critical',
      submittedBy: 'user-2',
      createdAt: '2026-11-12T00:05:00Z',
    },
    {
      id: '3',
      type: 'Hazard',
      location: 'Walkway north',
      description: 'Water leak on tiles',
      status: 'RESOLVED',
      urgency: 'Low',
      submittedBy: 'user-3',
      createdAt: '2026-11-12T00:10:00Z',
    },
  ];

  const stats = calculateReportStats(mockReports);
  assert.equal(stats.total, 3);
  assert.equal(stats.newCount, 1);
  assert.equal(stats.acknowledgedCount, 1);
  assert.equal(stats.resolvedCount, 1);
  assert.equal(stats.criticalCount, 1);
});

test('classifyUrgency identifies life-safety keywords', () => {
  assert.equal(classifyUrgency('Hazard', 'Person is unconscious near stairs'), 'Critical');
  assert.equal(classifyUrgency('Fire', 'Smell of smoke in hallway'), 'High');
  assert.equal(classifyUrgency('Hazard', 'Broken sprinkler leaking water'), 'Medium');
});

test('filterReports filters by status, type, and search queries', () => {
  const mockReports: EmergencyReport[] = [
    {
      id: 'rep-1',
      type: 'Medical',
      location: 'Science Hall 101',
      description: 'Severe allergic reaction',
      status: 'NEW',
      submittedBy: 'u1',
      submittedByEmail: 'student@campus.edu',
      createdAt: '2026-11-12T00:00:00Z',
    },
    {
      id: 'rep-2',
      type: 'Security',
      location: 'West Parking Lot',
      description: 'Suspicious vehicle near bike rack',
      status: 'ACKNOWLEDGED',
      submittedBy: 'u2',
      submittedByEmail: 'staff@campus.edu',
      createdAt: '2026-11-12T00:00:00Z',
    },
  ];

  const filteredByStatus = filterReports(mockReports, { status: 'NEW' });
  assert.equal(filteredByStatus.length, 1);
  assert.equal(filteredByStatus[0].id, 'rep-1');

  const filteredByType = filterReports(mockReports, { type: 'Security' });
  assert.equal(filteredByType.length, 1);
  assert.equal(filteredByType[0].id, 'rep-2');

  const filteredByQuery = filterReports(mockReports, { searchQuery: 'Parking' });
  assert.equal(filteredByQuery.length, 1);
  assert.equal(filteredByQuery[0].id, 'rep-2');
});

test('getStatusBadgeConfig matches style guide specifications', () => {
  const newBadge = getStatusBadgeConfig('NEW');
  assert.equal(newBadge.bg, '#FEE2E2');
  assert.equal(newBadge.text, '#B91C1C');
  assert.equal(newBadge.pulse, true);

  const ackBadge = getStatusBadgeConfig('ACKNOWLEDGED');
  assert.equal(ackBadge.bg, '#FEF3C7');
  assert.equal(ackBadge.text, '#B45309');
  assert.equal(ackBadge.pulse, false);

  const resBadge = getStatusBadgeConfig('RESOLVED');
  assert.equal(resBadge.bg, '#DCFCE7');
  assert.equal(resBadge.text, '#15803D');
  assert.equal(resBadge.pulse, false);
});
