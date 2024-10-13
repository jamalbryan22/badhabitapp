import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HabitsComponent } from './habits.component';
import { HabitService, UserHabit } from '../services/habit.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('HabitsComponent', () => {
  let component: HabitsComponent;
  let fixture: ComponentFixture<HabitsComponent>;
  let habitService: jasmine.SpyObj<HabitService>;

  const mockUserHabit: UserHabit = {
    userHabitId: 1,
    habitId: 1,
    habit: {
      habitId: 1,
      name: 'Test Habit',
      description: 'This is a test habit',
      defaultCostPerOccurrence: 10,
      defaultOccurrencesPerDay: 1,
      isDefault: true,
    },
    costPerOccurrence: 5,
    occurrencesPerDay: 1,
    isActive: true,
    startDate: '2024-01-01',
  };

  beforeEach(async () => {
    const habitServiceMock = jasmine.createSpyObj('HabitService', [
      'getDefaultHabits',
      'getUserHabits',
      'associateHabit',
      'createCustomHabit',
      'deleteUserHabit',
    ]);

    await TestBed.configureTestingModule({
      declarations: [HabitsComponent],
      imports: [FormsModule, HttpClientTestingModule],
      providers: [{ provide: HabitService, useValue: habitServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(HabitsComponent);
    component = fixture.componentInstance;
    habitService = TestBed.inject(HabitService) as jasmine.SpyObj<HabitService>;

    // Mock return values for service methods
    habitService.getDefaultHabits.and.returnValue(of([])); // Simulating empty array of habits
    habitService.getUserHabits.and.returnValue(of([])); // Simulating empty array of user habits
    habitService.associateHabit.and.returnValue(of(mockUserHabit)); // Simulating a UserHabit response
    habitService.createCustomHabit.and.returnValue(of(mockUserHabit)); // Simulating a UserHabit response
    habitService.deleteUserHabit.and.returnValue(of(void 0)); // Simulating void response

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load default habits on init', () => {
    expect(habitService.getDefaultHabits).toHaveBeenCalled();
  });

  it('should load user habits on init', () => {
    expect(habitService.getUserHabits).toHaveBeenCalled();
  });

  it('should associate a habit', () => {
    component.associateHabit(1);
    expect(habitService.associateHabit).toHaveBeenCalledWith(1);
    expect(component.userHabits.length).toBe(1);
  });

  it('should create a custom habit', () => {
    // Setting the values for the custom habit to be created
    component.newHabit = {
      name: 'Test Habit',
      description: 'Test Description',
      defaultCostPerOccurrence: 10,
      defaultOccurrencesPerDay: 1
    };

    component.createCustomHabit();

    expect(habitService.createCustomHabit).toHaveBeenCalledWith({
      name: 'Test Habit',
      description: 'Test Description',
      defaultCostPerOccurrence: 10,
      defaultOccurrencesPerDay: 1
    });
    expect(component.userHabits.length).toBe(1);
  });

  it('should delete a user habit when confirmed', () => {
    // Mock window.confirm to automatically return true (simulate clicking "OK")
    spyOn(window, 'confirm').and.returnValue(true);

    component.userHabits = [mockUserHabit];
    component.deleteUserHabit(mockUserHabit.userHabitId);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this habit?');
    expect(habitService.deleteUserHabit).toHaveBeenCalledWith(mockUserHabit.userHabitId);
    expect(component.userHabits.length).toBe(0);
  });

  it('should not delete a user habit when cancelled', () => {
    // Mock window.confirm to return false (simulate clicking "Cancel")
    spyOn(window, 'confirm').and.returnValue(false);

    component.userHabits = [mockUserHabit];
    component.deleteUserHabit(mockUserHabit.userHabitId);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this habit?');
    expect(habitService.deleteUserHabit).not.toHaveBeenCalled();
    expect(component.userHabits.length).toBe(1);
  });
});
