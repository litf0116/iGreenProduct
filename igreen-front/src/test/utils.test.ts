import { describe, it, expect } from 'vitest';
import { cn, formatDateTime, formatDate } from '../lib/utils';

describe('utils', () => {
    describe('cn', () => {
        it('should merge class names correctly', () => {
            expect(cn('foo', 'bar')).toBe('foo bar');
        });

        it('should handle conditional classes', () => {
            expect(cn('base', true && 'included', false && 'excluded')).toBe('base included');
        });

        it('should merge tailwind classes correctly', () => {
            expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
        });

        it('should handle undefined and null values', () => {
            expect(cn('base', undefined, null, 'end')).toBe('base end');
        });

        it('should handle object notation', () => {
            expect(cn({ active: true, disabled: false })).toBe('active');
        });
    });

    describe('formatDateTime', () => {
        it('should return "-" for null input', () => {
            expect(formatDateTime(null)).toBe('-');
        });

        it('should return "-" for undefined input', () => {
            expect(formatDateTime(undefined)).toBe('-');
        });

        it('should format Date object correctly', () => {
            const date = new Date(2024, 0, 15, 10, 30, 45);
            expect(formatDateTime(date)).toBe('2024-01-15 10:30:45');
        });

        it('should format ISO string correctly', () => {
            const result = formatDateTime('2024-03-20T14:25:30');
            expect(result).toBe('2024-03-20 14:25:30');
        });

        it('should handle string with space instead of T', () => {
            const result = formatDateTime('2024-03-20 14:25:30');
            expect(result).toBe('2024-03-20 14:25:30');
        });

        it('should return original string for invalid date', () => {
            expect(formatDateTime('invalid-date')).toBe('invalid-date');
        });

        it('should pad single digit values', () => {
            const date = new Date(2024, 0, 5, 5, 5, 5);
            expect(formatDateTime(date)).toBe('2024-01-05 05:05:05');
        });
    });

    describe('formatDate', () => {
        it('should return "-" for null input', () => {
            expect(formatDate(null)).toBe('-');
        });

        it('should return "-" for undefined input', () => {
            expect(formatDate(undefined)).toBe('-');
        });

        it('should format Date object correctly', () => {
            const date = new Date(2024, 5, 15);
            expect(formatDate(date)).toBe('2024-06-15');
        });

        it('should format ISO string correctly', () => {
            const result = formatDate('2024-03-20T14:25:30');
            expect(result).toBe('2024-03-20');
        });

        it('should handle string with space instead of T', () => {
            const result = formatDate('2024-03-20 14:25:30');
            expect(result).toBe('2024-03-20');
        });

        it('should return original string for invalid date', () => {
            expect(formatDate('invalid-date')).toBe('invalid-date');
        });

        it('should pad single digit month and day', () => {
            const date = new Date(2024, 0, 5);
            expect(formatDate(date)).toBe('2024-01-05');
        });
    });
});