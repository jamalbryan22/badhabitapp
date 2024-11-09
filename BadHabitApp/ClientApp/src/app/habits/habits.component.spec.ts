import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HabitsComponent } from './habits.component';
import { HabitService } from '../services/habit.service';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';

describe('HabitsComponent', () => {
  let component: HabitsComponent;
  let fixture: ComponentFixture<HabitsComponent>;
  let habitService: jasmine.SpyObj<HabitService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockHabit: any = {
    id: 1,
    addictionType: 'Smoking',
    habitDescription: 'Smoking cigarettes',
    userMotivation: 'To improve health',
    lastRelapseDate: '2024-11-05T00:00:00Z',
    costPerOccurrence: 10,
    reasonForLastRelapse: 'Stress',
    habitStartDate: '2024-11-01T00:00:00Z'
  };

  const mockUserHabit = {
    userHabitId: 2,
    userId: 'user123',
    name: 'Custom Habit',
    description: 'Custom Description',
    costPerOccurrence: 15,
    occurrencesPerDay: 1,
    isActive: true,
    startDate: '2024-01-01',
  };

  beforeEach(async () => {
    const habitServiceMock = jasmine.createSpyObj('HabitService', [
      'getUserHabit',
      'logRelapse',
      'createUserHabit',
      'deleteUserHabit',
    ]);
    const authServiceMock = jasmine.createSpyObj('AuthService', ['getUserID']);

    await TestBed.configureTestingModule({
      declarations: [HabitsComponent],
      imports: [FormsModule, HttpClientTestingModule],
      providers: [
        { provide: HabitService, useValue: habitServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HabitsComponent);
    component = fixture.componentInstance;
    habitService = TestBed.inject(HabitService) as jasmine.SpyObj<HabitService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    authService.getUserID.and.returnValue('user123');
    habitService.getUserHabit.and.returnValue(of(mockHabit));
    habitService.createUserHabit.and.returnValue(of(mockUserHabit));
    habitService.deleteUserHabit.and.returnValue(of(void 0));

    fixture.detectChanges();
  });

  it('should log relapse', () => {
    component.habit = mockHabit;
    component.reasonForRelapse = 'Had a stressful day';
    const error = new Error('Failed to log relapse');
    habitService.logRelapse.and.returnValue(of(void 0));

    component.logRelapse();

    expect(habitService.logRelapse).toHaveBeenCalledWith(mockHabit.id, component.reasonForRelapse);
    expect(component.successMessage).toBe('Relapse logged successfully.');
    expect(component.errorMessage).toBe('');
  });

  it('should handle error when logging relapse fails', fakeAsync(() => {
    component.habit = mockHabit;
    component.reasonForRelapse = 'Had a stressful day';
    const error = new Error('Failed to log relapse');
    habitService.logRelapse.and.returnValue(throwError(() => error));

    component.logRelapse();
    tick(); // Simulate the passage of asynchronous time

    expect(habitService.logRelapse).toHaveBeenCalledWith(mockHabit.id, component.reasonForRelapse);
    expect(component.errorMessage).toBe('Failed to log relapse.');
    expect(component.successMessage).toBe('');
  }));
});
