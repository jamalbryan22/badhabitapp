import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HabitService, UserHabit } from './habit.service';

describe('HabitService', () => {
  let service: HabitService;
  let httpMock: HttpTestingController;

  const mockHabit: UserHabit = {
    userHabitId: 1,
    userId: 'user123',
    habitId: 1,
    habit: {
      habitId: 1,
      name: 'Smoking',
      description: 'Smoking cigarettes',
      defaultCostPerOccurrence: null,
      defaultOccurrencesPerDay: null,
    },
    name: 'Smoking',
    description: 'Smoking cigarettes',
    costPerOccurrence: 10,
    occurrencesPerDay: 1,
    isActive: true,
    startDate: '2024-11-01T00:00:00Z',
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

  it('should fetch user habit via GET', () => {
    const userId = 'user123';

    service.getUserHabit(userId).subscribe((habit) => {
      expect(habit).toEqual(mockHabit);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/userhabits/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHabit); // Return mock data
  });

  it('should log relapse via POST', () => {
    const userId = 123;
    const reason = 'Had a stressful day';

    service.logRelapse(userId, reason).subscribe(() => {
      expect().nothing();
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/userhabits/${userId}/logrelapse`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(reason);
    expect(req.request.headers.get('Content-Type')).toBe('text/plain');
    req.flush({});
  });

  it('should create a user habit via POST', () => {
    const newHabitData = { name: 'New Habit', description: 'Custom Habit' };
    const mockResponse = { userHabitId: 2, ...newHabitData };

    service.createUserHabit(newHabitData).subscribe((userHabit) => {
      expect(userHabit).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/UserHabits`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newHabitData);
    req.flush(mockResponse);
  });

  it('should delete a user habit via DELETE', () => {
    const userHabitId = 1;

    service.deleteUserHabit(userHabitId).subscribe(() => {
      expect().nothing();
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/userhabits/${userHabitId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should handle errors', () => {
    const userId = 'user123';
    const errorMessage = 'An error occurred';

    service.getUserHabit(userId).subscribe(
      () => fail('should have failed with an error'),
      (error) => {
        expect(error).toContain('Server error');
      }
    );

    const req = httpMock.expectOne(`${service['baseUrl']}/userhabits/${userId}`);
    expect(req.request.method).toBe('GET');

    req.flush({ message: errorMessage }, { status: 500, statusText: 'Server Error' });
  });
});
