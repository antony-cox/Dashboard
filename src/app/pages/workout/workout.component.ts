import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { User } from 'app/models/user';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'app/services/authentication.service';
import { Workout } from 'app/models/workout';
import { WorkoutService } from 'app/services/workout.service';
import { Chart } from 'chart.js';
import { formatDate } from '@angular/common';

@Component({
    selector: 'workout-cmp',
    moduleId: module.id,
    templateUrl: 'workout.component.html'
})

export class WorkoutComponent implements OnInit{
    public user : User;
    public workouts: Workout[];
    public categories;
    public page = 1;

    workoutSearchForm = this.formBuilder.group({
      name: [''],
      categories: new FormArray([])
    });  

    get workoutCategoriesFormArray() {
      return this.workoutSearchForm.controls.categories as FormArray;
  }

    constructor(
        private authService: AuthenticationService,
        private formBuilder: FormBuilder,
        private workoutService: WorkoutService,
        private toastr: ToastrService
    ) {
        this.user = authService.currentUserValue;
        this.categories = ['', 'Endurance', 'Tempo', 'Sweet Spot', 'Threshold', 'VO2 Max', 'Anaerobic', 'Sprint'];
        this.categories.forEach(() => this.workoutCategoriesFormArray.push(new FormControl(false)));
        this.getWorkouts();
    }

    ngOnInit() {
      this.workouts = [];
    }

    getWorkouts()
    {
      let name = this.workoutSearchForm.controls.name.value;
      let category = '';

      this.categories.forEach(c => {
        if(this.workoutCategoriesFormArray.controls[this.categories.indexOf(c)].value)
        {
          category = c;
        } 
      });

      if(this.user.permissions.includes('WORKOUT'))
      {
        this.workoutService.get(this.page, name, category)
        .pipe(first())
        .subscribe(workouts => {
          this.setWorkouts(workouts);
        });
      }
    }

    setWorkouts(workouts)
    {
      let workout;
      this.workouts = [];

      workouts.forEach(w => {
        workout = w;
        workout.goals = workout.description.split('\n\nGoals\n\n')[1];
        workout.goals = workout.goals.replace('\n\n', '');

        workout.description = workout.description.split('\n\nGoals\n\n')[0];
        workout.description = workout.description.replace('How To\n\n', '');
        workout.description = workout.description.replace('Description\n\n', '');
        workout.description = workout.description.replace('\n\n', '');

        this.workouts.push(w);
      })
    }

    onSubmit()
    {
      this.page = 1
      this.getWorkouts()
    }

    movePage(x)
    {
      if(!(this.page == 1 && x == -1))
      {
        this.page += x;
        this.getWorkouts()
        window.scroll({
          top: 0, 
          left: 0, 
          behavior: 'smooth' 
         });
      }
    }

    showNotification(style, message)
    {
      this.toastr.info(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">' + message + '</span>',
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-" + style + " alert-with-icon",
            positionClass: "toast-top-right"
          }
        );   
    }
}

