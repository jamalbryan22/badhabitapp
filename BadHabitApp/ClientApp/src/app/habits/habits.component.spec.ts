import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HabitsComponent } from './habits.component';
import { HabitService, UserHabit, DefaultHabit } from '../services/habit.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';

describe('HabitsComponent', () => {
  let component: HabitsComponent;
  let fixture: ComponentFixture<HabitsComponent>;
  let habitService: jasmine.SpyObj<HabitService>;

  const mockUserHabit: UserHabit = {
    userHabitId: 1,
    userId: 'user123',
    habitId: 1,
    habit: {
      habitId: 1,
      name: 'Test Habit',
      description: 'This is a test habit',
      defaultCostPerOccurrence: 10,
      defaultOccurrencesPerDay: 1
    },
    costPerOccurrence: 5,
    occurrencesPerDay: 1,
    isActive: true,
    startDate: '2024-01-01',
  };

  const mockDefaultHabit: DefaultHabit = {
    habitId: 2,
    name: 'Default Test Habit',
    description: 'This is a default test habit',
    defaultCostPerOccurrence: 20,
    defaultOccurrencesPerDay: 2
  };

  beforeEach(async () => {
    const habitServiceMock = jasmine.createSpyObj('HabitService', [
      'getDefaultHabits',
      'getUserHabits',
      'createUserHabit',
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
    habitService.getDefaultHabits.and.returnValue(of([mockDefaultHabit]));
    habitService.getUserHabits.and.returnValue(of([mockUserHabit]));
    habitService.createUserHabit.and.returnValue(of(mockUserHabit));
    habitService.deleteUserHabit.and.returnValue(of(void 0));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load default habits on init', () => {
    expect(habitService.getDefaultHabits).toHaveBeenCalled();
    expect(component.defaultHabits.length).toBe(1);
  });

  it('should load user habits on init', () => {
    expect(habitService.getUserHabits).toHaveBeenCalled();
    expect(component.userHabits.length).toBe(1);
  });

  it('should populate form when a default habit is selected', () => {
    component.selectedDefaultHabit = mockDefaultHabit;
    component.populateFormWithDefaultHabit();

    expect(component.newHabit.habitId).toBe(2);
    expect(component.newHabit.name).toBe('Default Test Habit');
    expect(component.newHabit.description).toBe('This is a default test habit');
    expect(component.newHabit.costPerOccurrence).toBe(20);
    expect(component.newHabit.occurrencesPerDay).toBe(2);
  });

  it('should reset form when no default habit is selected', () => {
    component.selectedDefaultHabit = null;
    component.populateFormWithDefaultHabit(); // This should reset the form

    expect(component.newHabit.habitId).toBeNull();
    expect(component.newHabit.name).toBe('');
    expect(component.newHabit.description).toBe('');
    expect(component.newHabit.costPerOccurrence).toBeNull();
    expect(component.newHabit.occurrencesPerDay).toBeNull();
  });

  it('should save a custom habit', () => {
    // Setting the values for the custom habit to be created
    component.newHabit = {
      habitId: null,
      name: 'Test Habit',
      description: 'Test Description',
      costPerOccurrence: 10,
      occurrencesPerDay: 1
    };
    component.selectedDefaultHabit = null;

    component.saveHabit();

    expect(habitService.createUserHabit).toHaveBeenCalledWith({
      habitId: null,
      name: 'Test Habit',
      description: 'Test Description',
      costPerOccurrence: 10,
      occurrencesPerDay: 1
    });
    expect(component.userHabits.length).toBe(2); // Should add to existing user habits
    expect(component.successMessage).toBe('Habit created and associated successfully.');
  });

  it('should save a default habit', () => {
    component.selectedDefaultHabit = mockDefaultHabit;
    component.newHabit = {
      habitId: 2,
      name: '',
      description: '',
      costPerOccurrence: 25,
      occurrencesPerDay: 3
    };

    component.saveHabit();

    expect(habitService.createUserHabit).toHaveBeenCalledWith({
      habitId: 2,
      name: null,
      description: null,
      costPerOccurrence: 25,
      occurrencesPerDay: 3
    });
    expect(component.userHabits.length).toBe(2); // Adds the default habit
    expect(component.successMessage).toBe('Habit created and associated successfully.');
  });

  it('should display error message if custom habit has no name', () => {
    component.newHabit = {
      habitId: null,
      name: '',
      description: 'Test Description',
      costPerOccurrence: 10,
      occurrencesPerDay: 1
    };
    component.saveHabit();

    expect(component.errorMessage).toBe('Name is required for custom habits.');
    expect(habitService.createUserHabit).not.toHaveBeenCalled();
  });

  it('should delete a user habit when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.userHabits = [mockUserHabit];
    component.deleteUserHabit(mockUserHabit.userHabitId);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this habit?');
    expect(habitService.deleteUserHabit).toHaveBeenCalledWith(mockUserHabit.userHabitId);
    expect(component.userHabits.length).toBe(0);
    expect(component.successMessage).toBe('Habit deleted successfully.');
  });

  it('should not delete a user habit when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.userHabits = [mockUserHabit];
    component.deleteUserHabit(mockUserHabit.userHabitId);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this habit?');
    expect(habitService.deleteUserHabit).not.toHaveBeenCalled();
    expect(component.userHabits.length).toBe(1);
  });

  it('should start fading out success message after 3 seconds', fakeAsync(() => {
    // Arrange
    component.newHabit = {
      habitId: null,
      name: 'Test Habit',
      description: 'Test Description',
      costPerOccurrence: 10,
      occurrencesPerDay: 1
    };
    component.selectedDefaultHabit = null;

    // Mock the service method to return an observable
    habitService.createUserHabit.and.returnValue(of(mockUserHabit));

    // Act
    component.saveHabit();

    // Assert initial state after saveHabit()
    expect(component.successMessage).toBe('Habit created and associated successfully.');
    expect(component.isFadingOut).toBe(false);

    // Simulate passage of 3 seconds to trigger fade-out
    tick(3000);

    // Now, isFadingOut should be true
    expect(component.isFadingOut).toBe(true);

    // Simulate passage of 1 more second for fade-out completion
    tick(1000);

    // Success message should be cleared, and isFadingOut should be false
    expect(component.successMessage).toBe('');
    expect(component.isFadingOut).toBe(false);
  }));
});
