import type { CreateProjectDto, UpdateProjectDto } from './types';

/**
 * Validates if end date is after or equal to start date
 */
export function validateDateRange(startDate?: string, endDate?: string): boolean {
  if (!startDate || !endDate) return true; // Optional dates
  return new Date(endDate) >= new Date(startDate);
}

/**
 * Parses user ID from string or number to number
 */
export function parseUserId(userId: string | number): number {
  const parsed = typeof userId === 'string' ? parseInt(userId, 10) : userId;
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error('Invalid user ID');
  }
  return parsed;
}

/**
 * Prepares create project data, removing empty fields
 */
export function prepareCreateProjectData(data: Partial<CreateProjectDto>): CreateProjectDto {
  const cleaned: CreateProjectDto = {
    name_proyect: data.name_proyect || '',
    state: data.state || 'Planning',
    created_by: data.created_by || 0,
  };

  if (data.description && data.description.trim()) {
    cleaned.description = data.description.trim();
  }
  if (data.type && data.type.trim()) {
    cleaned.type = data.type.trim();
  }
  if (data.start_date) {
    cleaned.start_date = data.start_date;
  }
  if (data.end_date) {
    cleaned.end_date = data.end_date;
  }

  return cleaned;
}

/**
 * Prepares update project data, removing empty fields
 */
export function prepareUpdateProjectData(data: Partial<UpdateProjectDto>): Partial<UpdateProjectDto> {
  const cleaned: Partial<UpdateProjectDto> = {};

  if (data.name_proyect && data.name_proyect.trim()) {
    cleaned.name_proyect = data.name_proyect.trim();
  }
  if (data.description !== undefined) {
    cleaned.description = data.description?.trim() || undefined;
  }
  if (data.type !== undefined) {
    cleaned.type = data.type?.trim() || undefined;
  }
  if (data.state) {
    cleaned.state = data.state;
  }
  if (data.start_date) {
    cleaned.start_date = data.start_date;
  }
  if (data.end_date) {
    cleaned.end_date = data.end_date;
  }

  return cleaned;
}

