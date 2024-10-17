import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HabitService, DefaultHabit, UserHabit } from './habit.service';

describe('HabitService', () => {
  let service: HabitService;
  let httpMock: HttpTestingController;

  const mockDefaultHabit: DefaultHabit = {
    habitId: 1,
    name: 'Test Habit',
    description: 'This is a test habit',
    defaultCostPerOccurrence: 10,
    defaultOccurrencesPerDay: 2
  };

  const mockUserHabit: UserHabit = {
    userHabitId: 1,
    userId: 'user123',
    habitId: 1,
    habit: mockDefaultHabit,
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
    service.getDefaultHabits().subscribe((habits: DefaultHabit[]) => {
      expect(habits.length).toBe(1);
      expect(habits).toEqual([mockDefaultHabit]);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/defaulthabits`);
    expect(req.request.method).toBe('GET');
    req.flush([mockDefaultHabit]); // Return mock data
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

  it('should create a user habit via POST', () => {
    const newHabitData = { name: 'New Habit', description: 'Custom Habit' };

    service.createUserHabit(newHabitData).subscribe((userHabit: UserHabit) => {
      expect(userHabit).toEqual(mockUserHabit);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/userhabits`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newHabitData);
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
