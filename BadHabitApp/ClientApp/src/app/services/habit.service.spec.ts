import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HabitService, Habit, UserHabit } from './habit.service';

describe('HabitService', () => {
  let service: HabitService;
  let httpMock: HttpTestingController;

  const mockHabit: Habit = {
    habitId: 1,
    name: 'Test Habit',
    description: 'This is a test habit',
    defaultCostPerOccurrence: 10,
    defaultOccurrencesPerDay: 2,
    isDefault: true
  };

  const mockUserHabit: UserHabit = {
    userHabitId: 1,
    habitId: 1,
    habit: mockHabit,
    costPerOccurrence: 5,
    occurrencesPerDay: 2,
    isActive: true,
    startDate: '2024-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HabitService]
    });
    service = TestBed.inject(HabitService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ensure no outstanding requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch default habits via GET', () => {
    service.getDefaultHabits().subscribe((habits: Habit[]) => {
      expect(habits.length).toBe(1);
      expect(habits).toEqual([mockHabit]);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/habits/defaults`);
    expect(req.request.method).toBe('GET');
    req.flush([mockHabit]); // Return mock data
  });

  it('should fetch user habits via GET', () => {
    service.getUserHabits().subscribe((userHabits: UserHabit[]) => {
      expect(userHabits.length).toBe(1);
      expect(userHabits).toEqual([mockUserHabit]);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/userhabits`);
    expect(req.request.method).toBe('GET');
    req.flush([mockUserHabit]); // Return mock data
  });

  it('should create a custom habit via POST', () => {
    const newHabitData = { name: 'New Habit', description: 'Custom Habit' };

    service.createCustomHabit(newHabitData).subscribe((userHabit: UserHabit) => {
      expect(userHabit).toEqual(mockUserHabit);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/userhabits`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newHabitData);
    req.flush(mockUserHabit); // Return mock data
  });

  it('should associate a default habit via POST', () => {
    const habitId = 1;

    service.associateHabit(habitId).subscribe((userHabit: UserHabit) => {
      expect(userHabit).toEqual(mockUserHabit);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/userhabits/associate`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ habitId });
    req.flush(mockUserHabit); // Return mock data
  });

  it('should delete a user habit via DELETE', () => {
    const userHabitId = 1;

    service.deleteUserHabit(userHabitId).subscribe(() => {
      // Test successful delete with no return value
      expect().nothing();
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/userhabits/${userHabitId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({}); // Simulate success with no response body
  });
});
