import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { User } from 'app/models/user';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'app/services/authentication.service';
import { Workout } from 'app/models/workout';
import { WorkoutService } from 'app/services/workout.service';
import Chart from 'chart.js';
import { formatDate } from '@angular/common';

@Component({
    selector: 'workoutDetail-cmp',
    moduleId: module.id,
    templateUrl: 'workoutDetail.component.html'
})

export class WorkoutDetailComponent implements OnInit{
    public user : User;
    public workout: Workout;
    public id;

    constructor(
        private authService: AuthenticationService,
        private formBuilder: FormBuilder,
        private workoutService: WorkoutService,
        private toastr: ToastrService,
        private activatedRoute: ActivatedRoute
    ) {
        this.user = authService.currentUserValue;
        this.id = this.activatedRoute.snapshot.paramMap.get("id");
        this.getWorkout();
    }

    ngOnInit() {
      this.workout = new Workout();
    }

    getWorkout()
    {
      if(this.user.permissions.includes('WORKOUT'))
      {
        this.workoutService.getDetail(this.id)
        .pipe(first())
        .subscribe(workout => {
          this.workout = workout;
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

